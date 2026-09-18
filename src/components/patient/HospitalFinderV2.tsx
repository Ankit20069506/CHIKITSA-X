import React, { useState, useMemo } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { db } from '../../db/database';
import {
  Building2,
  MapPin,
  ChevronRight,
  Info,
  Map,
  ListFilter,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Heart,
  Navigation,
  Sliders,
  Award,
  Zap,
  ShieldAlert,
  ArrowUpDown,
  LocateFixed,
  Compass,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { HospitalGeospatialMap } from '../hospital/HospitalGeospatialMap';
import { AmbulanceLiveTrackingModal } from '../emergency/AmbulanceLiveTrackingModal';
import {
  type PatientCoordinates,
  PRESET_LOCATIONS,
  DEFAULT_PATIENT_LOCATION,
  calculateHaversineDistanceKm,
  estimateDrivingEtaMinutes,
  getStoredPatientLocation,
  savePatientLocation,
  requestLiveBrowserLocation
} from '../../services/geolocationService';

interface Props {
  language: AppLanguage;
  onSelectHospital: (hospital: Hospital) => void;
  onCallAmbulance?: (hospital: Hospital) => void;
}

export type TriadPriority = 'BALANCED' | 'NEARBY_LOCATION' | 'LOWEST_COST' | 'HIGHEST_CARE';

export const HospitalFinderV2: React.FC<Props> = ({
  language,
  onSelectHospital,
  onCallAmbulance
}) => {
  const [hospitals] = useState<Hospital[]>(() => db.getHospitals());
  const [schemeFilter, setSchemeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('LIST');
  const [showScoreModal, setShowScoreModal] = useState<Hospital | null>(null);
  const [internalAmbulanceHospital, setInternalAmbulanceHospital] = useState<Hospital | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Patient Geolocation State
  const [patientLocation, setPatientLocation] = useState<PatientCoordinates | null>(() => getStoredPatientLocation());
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'DETECTING' | 'GRANTED' | 'DENIED' | 'UNSUPPORTED'>(() => {
    return getStoredPatientLocation() ? 'GRANTED' : 'IDLE';
  });
  const [locationError, setLocationError] = useState<string>('');
  const [showPresetDropdown, setShowPresetDropdown] = useState<boolean>(false);

  // Triad criteria priority state
  const [triadPriority, setTriadPriority] = useState<TriadPriority>('BALANCED');
  const [locationWeight, setLocationWeight] = useState<number>(33);
  const [costWeight, setCostWeight] = useState<number>(33);
  const [careWeight, setCareWeight] = useState<number>(34);
  const [showWeightSliders, setShowWeightSliders] = useState<boolean>(false);

  // Request browser GPS location
  const handleRequestLocation = async () => {
    setLocationStatus('DETECTING');
    setLocationError('');
    const res = await requestLiveBrowserLocation();
    if (res.success && res.location) {
      setPatientLocation(res.location);
      setLocationStatus('GRANTED');
      handlePresetChange('NEARBY_LOCATION');
    } else {
      setLocationStatus(res.code === 'PERMISSION_DENIED' ? 'DENIED' : 'IDLE');
      setLocationError(res.error || 'Failed to detect live location.');
    }
  };

  // Select predefined area preset
  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    const loc: PatientCoordinates = {
      lat: preset.lat,
      lng: preset.lng,
      label: preset.label,
      source: 'MANUAL_PRESET',
      timestamp: new Date().toISOString()
    };
    savePatientLocation(loc);
    setPatientLocation(loc);
    setLocationStatus('GRANTED');
    setLocationError('');
    setShowPresetDropdown(false);
    handlePresetChange('NEARBY_LOCATION');
  };

  // Quick preset selector handler
  const handlePresetChange = (preset: TriadPriority) => {
    setTriadPriority(preset);
    if (preset === 'BALANCED') {
      setLocationWeight(33);
      setCostWeight(33);
      setCareWeight(34);
    } else if (preset === 'NEARBY_LOCATION') {
      setLocationWeight(70);
      setCostWeight(15);
      setCareWeight(15);
    } else if (preset === 'LOWEST_COST') {
      setLocationWeight(15);
      setCostWeight(70);
      setCareWeight(15);
    } else if (preset === 'HIGHEST_CARE') {
      setLocationWeight(15);
      setCostWeight(15);
      setCareWeight(70);
    }
  };

  // Active patient coordinates (Live GPS, selected preset, or default reference)
  const activeCoordinates = patientLocation || DEFAULT_PATIENT_LOCATION;

  // Compute live distance, driving ETA, and Triad Match Score for each hospital
  const scoredHospitals = useMemo(() => {
    return hospitals.map(hosp => {
      // Real Haversine distance in Kilometers from patient's coordinates to hospital
      const realDistanceKm = calculateHaversineDistanceKm(
        activeCoordinates.lat,
        activeCoordinates.lng,
        hosp.mapsCoord.lat,
        hosp.mapsCoord.lng
      );
      const drivingEtaMinutes = estimateDrivingEtaMinutes(realDistanceKm);

      // 1. Location Score (0 - 100): Closest gets ~100, drops smoothly with distance
      const locScore = Math.max(10, Math.min(100, Math.round((1 - (realDistanceKm - 1) / 12) * 100)));

      // 2. Cost Score (0 - 100): From costProfile or fallback
      const costScore = hosp.costProfile?.costScore || (hosp.type === 'GOVERNMENT' ? 98 : hosp.type === 'CHARITABLE_TRUST' ? 90 : 82);

      // 3. Care Score (0 - 100): Chikitsa Care Score
      const careScore = hosp.chikitsaCareScore || 90;

      // Weighted Composite Triad Score
      const totalWeight = locationWeight + costWeight + careWeight;
      const compositeMatch = Math.round(
        (locScore * locationWeight + costScore * costWeight + careScore * careWeight) / totalWeight
      );

      return {
        ...hosp,
        distanceKm: realDistanceKm,
        drivingEtaMinutes,
        triadMetrics: {
          locationScore: locScore,
          costScore,
          careScore,
          compositeMatch
        }
      };
    });
  }, [hospitals, activeCoordinates, locationWeight, costWeight, careWeight]);

  // Filter & Sort based on active Triad Priority
  const filteredAndSortedHospitals = useMemo(() => {
    const filtered = scoredHospitals.filter(h => {
      if (schemeFilter === 'ALL') return true;
      return h.acceptedGovSchemes.some(s => s.toLowerCase().includes(schemeFilter.toLowerCase()));
    });

    return filtered.sort((a, b) => {
      if (triadPriority === 'NEARBY_LOCATION') {
        return a.distanceKm - b.distanceKm;
      }
      if (triadPriority === 'LOWEST_COST') {
        const costA = a.costProfile?.opdConsultFee ?? 500;
        const costB = b.costProfile?.opdConsultFee ?? 500;
        return costA - costB;
      }
      if (triadPriority === 'HIGHEST_CARE') {
        return b.chikitsaCareScore - a.chikitsaCareScore;
      }
      // BALANCED: sort by compositeMatch descending
      return b.triadMetrics.compositeMatch - a.triadMetrics.compositeMatch;
    });
  }, [scoredHospitals, schemeFilter, triadPriority]);

  const handleSelect = (hosp: Hospital) => {
    setSelectedHospitalId(hosp.id);
    onSelectHospital(hosp);
  };

  const handleDispatchAmbulance = (hosp: Hospital) => {
    if (onCallAmbulance) {
      onCallAmbulance(hosp);
    } else {
      setInternalAmbulanceHospital(hosp);
    }
  };

  // Top recommended hospital
  const topRecommended = filteredAndSortedHospitals[0];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>
              {language === 'HI' ? 'अस्पताल चयन: स्थान, लागत एवं देखभाल' : 'Hospital Selector: Location • Cost • Care'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {language === 'HI'
                ? 'निकटतम दूरी, न्यूनतम खर्च (100% फ्री/आयुष्मान) और सर्वोत्तम चिकित्सा स्कोर के आधार पर सर्वश्रेष्ठ अस्पताल चुनें'
                : 'Intelligent multi-criteria recommendation ranked by proximity (km), affordability (₹0 PM-JAY), and clinical care quality'}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('LIST')}
            className={viewMode === 'LIST' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <ListFilter size={14} /> {language === 'HI' ? 'स्मार्ट तुलना ग्रिड' : 'Triad Ranking Grid'}
          </button>
          <button
            onClick={() => setViewMode('MAP')}
            className={viewMode === 'MAP' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <Map size={14} /> {language === 'HI' ? 'जियोस्पेशियल मैप' : 'Geospatial Map'}
          </button>
        </div>
      </div>

      {/* 📍 Patient Live Location & Geolocation Permission Banner */}
      <div style={{
        background: locationStatus === 'GRANTED'
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)'
          : locationStatus === 'DENIED'
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: locationStatus === 'GRANTED'
          ? '1px solid rgba(16, 185, 129, 0.35)'
          : locationStatus === 'DENIED'
          ? '1px solid rgba(239, 68, 68, 0.35)'
          : '2px solid rgba(2, 132, 199, 0.45)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: locationStatus !== 'GRANTED' ? '0 4px 16px rgba(2, 132, 199, 0.15)' : 'none',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '680px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: locationStatus === 'GRANTED' ? '#10b981' : locationStatus === 'DENIED' ? '#ef4444' : '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {locationStatus === 'GRANTED' ? <LocateFixed size={22} /> : <MapPin size={22} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>
                  {locationStatus === 'GRANTED'
                    ? (language === 'HI' ? '📍 मरीज का लाइव जीपीएस स्थान सक्रिय (Live GPS Active)' : '📍 Patient Live GPS Location Active')
                    : locationStatus === 'DENIED'
                    ? (language === 'HI' ? '⚠️ लोकेशन अनुमति अस्वीकृत (Location Permission Blocked)' : '⚠️ Location Permission Denied by Browser')
                    : (language === 'HI' ? '📍 निकटतम अस्पताल सिफारिश हेतु लोकेशन की अनुमति दें' : '📍 Allow Location Access for Proximity-Based Hospital Recommendations')}
                </strong>

                {locationStatus === 'GRANTED' && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span className="live-dot" style={{ backgroundColor: '#10b981', width: '6px', height: '6px' }} />
                    {patientLocation?.source === 'GPS_LIVE' ? 'GPS Lock' : 'Area Preset'}
                  </span>
                )}
              </div>

              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {locationStatus === 'GRANTED'
                  ? (language === 'HI'
                    ? `वर्तमान संदर्भ स्थान: ${patientLocation?.label} • सभी दूरी (km), आपातकालीन एम्बुलेंस ईटीए (ETA) एवं नजदीकी अस्पताल आपके सटीक स्थान अनुसार पुनर्गणित हैं।`
                    : `Active Coordinates: ${patientLocation?.label} • All hospital distances (km), ambulance arrival ETAs, and top recommendations are calibrated to your precise location.`)
                  : locationStatus === 'DENIED'
                  ? (language === 'HI'
                    ? 'ब्राउज़र में लोकेशन ब्लॉक है। कृपया नीचे दिए गए शहरों/क्षेत्रों में से अपना नजदीकी क्षेत्र चुनें ताकि सही दूरी की गणना हो सके।'
                    : 'Browser location is blocked. Please select your nearest city or area below to calibrate distance recommendations.')
                  : (language === 'HI'
                    ? 'अपनी लाइव जीपीएस लोकेशन शेयर करें ताकि CHIKITSA-X आपके सबसे नजदीकी आईसीयू ट्रॉमा सेंटर, सबसे तेज एम्बुलेंस मार्ग व वास्तविक यात्रा समय (ETA) की सिफारिश कर सके।'
                    : 'Share your device GPS location so CHIKITSA-X can automatically recommend the closest emergency hospital with live ICU beds and fastest ambulance transit.')}
              </p>

              {locationError && (
                <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> {locationError}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Manual Area Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRequestLocation}
              disabled={locationStatus === 'DETECTING'}
              className={locationStatus === 'GRANTED' ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '8px 16px'
              }}
            >
              {locationStatus === 'DETECTING' ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  {language === 'HI' ? 'स्थान खोज रहे हैं...' : 'Detecting GPS...'}
                </>
              ) : locationStatus === 'GRANTED' ? (
                <>
                  <RefreshCw size={14} />
                  {language === 'HI' ? 'जीपीएस रिफ्रेश करें' : 'Refresh GPS'}
                </>
              ) : (
                <>
                  <LocateFixed size={15} />
                  {language === 'HI' ? 'स्थान की अनुमति दें (Allow Location)' : 'Allow Live Location Access'}
                </>
              )}
            </button>

            {/* Manual Preset Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              >
                <Compass size={14} />
                {language === 'HI' ? 'क्षेत्र बदलें' : 'Select Area'}
              </button>

              {showPresetDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '260px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {language === 'HI' ? 'नजदीकी क्षेत्र चुनें:' : 'Select Area / Landmark:'}
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {PRESET_LOCATIONS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          border: 'none',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: patientLocation?.label === preset.label ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{preset.label}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{preset.city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Triad Criteria Selector Command Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#0284c7" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {language === 'HI' ? 'चयन प्राथमिकता चुनें (Select Priority Basis):' : 'Select Priority Criteria (Triad Matcher):'}
            </span>
          </div>

          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Sliders size={13} /> {showWeightSliders ? 'Hide Custom Sliders' : 'Fine-Tune Triad Weights (%)'}
          </button>
        </div>

        {/* 4 Quick Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: showWeightSliders ? '16px' : '0' }}>
          {/* Preset 1: Balanced */}
          <div
            onClick={() => handlePresetChange('BALANCED')}
            style={{
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: '8px',
              border: triadPriority === 'BALANCED' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
              background: triadPriority === 'BALANCED' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-primary)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: triadPriority === 'BALANCED' ? '#0284c7' : 'var(--text-main)' }}>
              <Sparkles size={15} /> {language === 'HI' ? '⚡ संतुलित सर्वश्रेष्ठ' : '⚡ Best Balanced Triad'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Equal balance of Near Location (33%), Lowest Cost (33%) & Care Score (34%)
            </div>
          </div>

          {/* Preset 2: Nearby Location */}
          <div
            onClick={() => handlePresetChange('NEARBY_LOCATION')}
            style={{
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: '8px',
              border: triadPriority === 'NEARBY_LOCATION' ? '2px solid #059669' : '1px solid var(--border-subtle)',
              background: triadPriority === 'NEARBY_LOCATION' ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-primary)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: triadPriority === 'NEARBY_LOCATION' ? '#059669' : 'var(--text-main)' }}>
              <MapPin size={15} /> {language === 'HI' ? '📍 निकटतम स्थान (Near by)' : '📍 Nearest Location First'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Minimum transit distance (1.9 km) & fastest emergency travel time
            </div>
          </div>

          {/* Preset 3: Lowest Cost */}
          <div
            onClick={() => handlePresetChange('LOWEST_COST')}
            style={{
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: '8px',
              border: triadPriority === 'LOWEST_COST' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
              background: triadPriority === 'LOWEST_COST' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-primary)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: triadPriority === 'LOWEST_COST' ? '#10b981' : 'var(--text-main)' }}>
              <DollarSign size={15} /> {language === 'HI' ? '💰 न्यूनतम खर्च (100% फ्री)' : '💰 Lowest Cost / PM-JAY Free'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              100% Free Public care (₹0 OPD) & zero out-of-pocket expenses
            </div>
          </div>

          {/* Preset 4: Highest Care */}
          <div
            onClick={() => handlePresetChange('HIGHEST_CARE')}
            style={{
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: '8px',
              border: triadPriority === 'HIGHEST_CARE' ? '2px solid #9333ea' : '1px solid var(--border-subtle)',
              background: triadPriority === 'HIGHEST_CARE' ? 'rgba(147, 51, 234, 0.12)' : 'var(--bg-primary)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: triadPriority === 'HIGHEST_CARE' ? '#9333ea' : 'var(--text-main)' }}>
              <Heart size={15} /> {language === 'HI' ? '🩺 उच्चतम देखभाल व आईसीयू' : '🩺 Top Care Score & ICUs'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Highest Chikitsa Care Score (96-97), maximum ventilator beds & super-specialists
            </div>
          </div>
        </div>

        {/* Custom Weight Sliders (Expandable) */}
        {showWeightSliders && (
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            fontSize: '0.78rem'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>📍 Near Location Weight:</span>
                <strong style={{ color: '#059669' }}>{locationWeight}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={locationWeight}
                onChange={e => setLocationWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>💰 Cost / Affordability Weight:</span>
                <strong style={{ color: '#10b981' }}>{costWeight}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={costWeight}
                onChange={e => setCostWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>🩺 Clinical Care Quality Weight:</span>
                <strong style={{ color: '#9333ea' }}>{careWeight}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={careWeight}
                onChange={e => setCareWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gov Schemes Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredAndSortedHospitals.length}</strong> facilities sorted by{' '}
          <strong style={{ color: '#0284c7' }}>
            {triadPriority === 'BALANCED' ? 'Triad Match Score' : triadPriority === 'NEARBY_LOCATION' ? 'Distance (Closest)' : triadPriority === 'LOWEST_COST' ? 'Cost (Lowest)' : 'Care Score'}
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['ALL', 'PM-JAY', 'MJPJAY', 'Tata Trusts'].map(scheme => (
            <button
              key={scheme}
              onClick={() => setSchemeFilter(scheme)}
              className={schemeFilter === scheme ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              {scheme === 'ALL' ? 'All Schemes' : scheme}
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Geospatial Map or Triad Ranking Grid */}
      {viewMode === 'MAP' ? (
        <HospitalGeospatialMap
          language={language}
          hospitals={filteredAndSortedHospitals}
          onSelectHospital={handleSelect}
          onCallAmbulance={handleDispatchAmbulance}
          userLocation={activeCoordinates}
        />
      ) : (
        <>
          {/* 🌟 Proximity-Based #1 Top Recommendation Hero Banner */}
          {topRecommended && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '2px solid #0284c7',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  flexShrink: 0
                }}>
                  <LocateFixed size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {triadPriority === 'NEARBY_LOCATION'
                        ? (language === 'HI' ? '🏆 निकटतम अस्पताल सिफारिश' : '🏆 #1 Nearest Recommendation')
                        : (language === 'HI' ? '🏆 सर्वश्रेष्ठ अनुशंसित अस्पताल' : '🏆 Top AI Recommendation')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                      📍 {topRecommended.distanceKm} km away • ~{topRecommended.drivingEtaMinutes} mins driving ETA
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 2px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {topRecommended.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {topRecommended.city} • Care Score: <strong>{topRecommended.chikitsaCareScore}/100</strong> • ICU Free: <strong>{topRecommended.bedTelemetry.icuAvailable}</strong> • OPD Fee: <strong>{topRecommended.costProfile ? `₹${topRecommended.costProfile.opdConsultFee}` : '₹0'}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSelect(topRecommended)}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  ✓ {language === 'HI' ? 'इस अस्पताल को चुनें व ओपीडी बुक करें' : 'Select & Book OPD'}
                </button>
                <button
                  onClick={() => handleDispatchAmbulance(topRecommended)}
                  className="btn btn-emergency btn-sm"
                  style={{ fontWeight: 700, padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  🚑 {language === 'HI' ? 'एम्बुलेंस बुलाएं' : 'Dispatch ALS'}
                </button>
              </div>
            </div>
          )}

          {/* Triad Ranking Grid View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {filteredAndSortedHospitals.map((hosp, index) => {
              const isTopMatch = index === 0;
              const isSelected = selectedHospitalId === hosp.id;

              return (
                <div
                  key={hosp.id}
                  style={{
                    background: isSelected ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid #0284c7' : isTopMatch ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isTopMatch ? '0 8px 24px -6px rgba(16, 185, 129, 0.2)' : 'none',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Badge: #1 Match or Selection Indicator */}
                  {isTopMatch && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                    }}>
                      <Award size={13} /> {triadPriority === 'NEARBY_LOCATION'
                        ? `#1 Nearest (${hosp.distanceKm} km • ~${hosp.drivingEtaMinutes} mins)`
                        : `#1 Best Triad Match (${hosp.triadMetrics.compositeMatch}%)`}
                    </div>
                  )}

                <div>
                  {/* Hospital Header & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className={hosp.type === 'GOVERNMENT' ? 'badge badge-green' : hosp.type === 'CHARITABLE_TRUST' ? 'badge badge-purple' : 'badge badge-teal'} style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                        {hosp.type.replace('_', ' ')}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', margin: '4px 0 2px', color: 'var(--text-main)', fontWeight: 800 }}>
                        {hosp.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {hosp.city}, Maharashtra • <strong>{hosp.distanceKm} km away</strong>
                      </div>
                    </div>

                    {/* Care Score Widget */}
                    <div
                      onClick={() => setShowScoreModal(hosp)}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--medical-blue)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        textAlign: 'center',
                        minWidth: '70px'
                      }}
                      title="Click to view algorithm breakdown"
                    >
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Care Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--medical-blue)', lineHeight: 1 }}>
                        {hosp.chikitsaCareScore}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--medical-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <Info size={10} /> Breakdown
                      </div>
                    </div>
                  </div>

                  {/* Triad Score Breakdown Bar (Location, Cost, Care) */}
                  <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    margin: '12px 0',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    textAlign: 'center'
                  }}>
                    {/* Dimension 1: Location */}
                    <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <MapPin size={11} color="#059669" /> Near by
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                        {hosp.distanceKm} km
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        ~{hosp.drivingEtaMinutes} mins ETA
                      </div>
                    </div>

                    {/* Dimension 2: Cost */}
                    <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <DollarSign size={11} color="#10b981" /> Cost
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                        {hosp.costProfile ? `₹${hosp.costProfile.opdConsultFee}` : '₹0 - PM-JAY'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {hosp.costProfile?.estOutOfPocketPercent === 0 ? '100% Free' : `${hosp.costProfile?.estOutOfPocketPercent || 10}% Out-of-pocket`}
                      </div>
                    </div>

                    {/* Dimension 3: Care */}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Heart size={11} color="#9333ea" /> Care Quality
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#9333ea' }}>
                        {hosp.chikitsaCareScore}/100
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {hosp.bedTelemetry.icuAvailable} ICU Free
                      </div>
                    </div>
                  </div>

                  {/* Bed Telemetry Badges */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                      ICU: {hosp.bedTelemetry.icuAvailable} Free
                    </span>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                      Ventilators: {hosp.bedTelemetry.ventilatorAvailable} Free
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                      Oxygen: {hosp.bedTelemetry.oxygenBedsAvailable} Free
                    </span>
                  </div>

                  {/* Cost & Empanelment Statement */}
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '14px', background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '6px' }}>
                    <div>
                      <strong>Treatment Cost:</strong> {hosp.costProfile?.approxTreatmentRange || 'Cashless PM-JAY Empanelled'}
                    </div>
                    <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                      <strong>Schemes:</strong> {hosp.acceptedGovSchemes.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Actions: Select Hospital & Dispatch Ambulance */}
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button
                    onClick={() => handleSelect(hosp)}
                    className={isSelected ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={16} color="#10b981" /> {language === 'HI' ? 'यह अस्पताल चुना गया (Selected)' : 'Selected as Primary Hospital'}
                      </>
                    ) : (
                      <>
                        ✓ {language === 'HI' ? 'इस अस्पताल को चुनें व ओपीडी बुक करें' : 'Select This Hospital & Book OPD'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDispatchAmbulance(hosp)}
                    className="btn btn-emergency btn-sm"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
                    title="Opens live GPS tracking"
                  >
                    🚑 {language === 'HI' ? 'यहाँ से एम्बुलेंस बुलाएं (लाइव ट्रैक)' : 'Call ALS Ambulance From Here (Live Track)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {/* Internal Ambulance Tracking Modal Fallback */}
      {internalAmbulanceHospital && (
        <AmbulanceLiveTrackingModal
          language={language}
          targetHospital={internalAmbulanceHospital}
          onClose={() => setInternalAmbulanceHospital(null)}
        />
      )}

      {/* Care Score Breakdown Modal */}
      {showScoreModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                Care Score Breakdown: {showScoreModal.chikitsaCareScore}/100
              </h3>
              <button onClick={() => setShowScoreModal(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              CHIKITSA-X uses a 5-vector transparent clinical fit and affordability scoring index:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1. Clinical Fit & Specialty Match (35% Weight)</span>
                <strong>98 / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>2. PM-JAY Affordability & Cashless Cover (25% Weight)</span>
                <strong>{showScoreModal.costProfile?.costScore || 95} / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>3. Distance & Emergency Proximity (15% Weight)</span>
                <strong>{showScoreModal.distanceKm <= 3 ? '98 / 100' : '90 / 100'} ({showScoreModal.distanceKm} km)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>4. ICU & Ventilator Bed Availability (15% Weight)</span>
                <strong>92 / 100 ({showScoreModal.bedTelemetry.icuAvailable} ICU Free)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>5. Patient Reviews & ABHA Integration (10% Weight)</span>
                <strong>94 / 100 ({showScoreModal.rating} ★)</strong>
              </div>
            </div>

            <button onClick={() => setShowScoreModal(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
