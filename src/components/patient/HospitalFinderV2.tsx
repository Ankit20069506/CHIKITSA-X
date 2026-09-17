import React, { useState } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { db } from '../../db/database';
import { Building2, MapPin, ChevronRight, Info, Map, ListFilter, AlertTriangle, PhoneCall } from 'lucide-react';
import { HospitalGeospatialMap } from '../hospital/HospitalGeospatialMap';
import { AmbulanceLiveTrackingModal } from '../emergency/AmbulanceLiveTrackingModal';

interface Props {
  language: AppLanguage;
  onSelectHospital: (hospital: Hospital) => void;
  onCallAmbulance?: (hospital: Hospital) => void;
}

export const HospitalFinderV2: React.FC<Props> = ({
  language,
  onSelectHospital,
  onCallAmbulance
}) => {
  const [hospitals] = useState<Hospital[]>(() => db.getHospitals());
  const [schemeFilter, setSchemeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [showScoreModal, setShowScoreModal] = useState<Hospital | null>(null);
  const [internalAmbulanceHospital, setInternalAmbulanceHospital] = useState<Hospital | null>(null);

  const filteredHospitals = hospitals.filter(h => {
    if (schemeFilter === 'ALL') return true;
    return h.acceptedGovSchemes.some(s => s.toLowerCase().includes(schemeFilter.toLowerCase()));
  });

  const handleDispatchAmbulance = (hosp: Hospital) => {
    if (onCallAmbulance) {
      onCallAmbulance(hosp);
    } else {
      setInternalAmbulanceHospital(hosp);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'अस्पताल खोजक एवं चिकित्सा केयर स्कोर' : 'Empaneled Hospital Finder & Geospatial Engine'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI'
                ? 'लाइव जीपीएस रडार मैप, आईसीयू बेड स्थिति व 1-टैप एम्बुलेंस डिस्पैच'
                : 'Interactive GPS radar map, live ICU telemetry, and instant 1-Tap ALS ambulance tracking'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Scheme Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('MAP')}
              className={viewMode === 'MAP' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            >
              <Map size={14} /> {language === 'HI' ? 'जियोस्पेशियल मैप' : 'Geospatial Map'}
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={viewMode === 'LIST' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            >
              <ListFilter size={14} /> {language === 'HI' ? 'सूची ग्रिड' : 'Directory Grid'}
            </button>
          </div>

          {/* Gov Schemes */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['ALL', 'PM-JAY', 'MJPJAY', 'Tata Trusts'].map(scheme => (
              <button
                key={scheme}
                onClick={() => setSchemeFilter(scheme)}
                className={schemeFilter === scheme ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {scheme === 'ALL' ? 'All Schemes' : scheme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Geospatial Map View */}
      {viewMode === 'MAP' ? (
        <HospitalGeospatialMap
          language={language}
          hospitals={filteredHospitals}
          onSelectHospital={onSelectHospital}
          onCallAmbulance={handleDispatchAmbulance}
        />
      ) : (
        /* List / Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredHospitals.map(hosp => (
            <div
              key={hosp.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className={hosp.type === 'GOVERNMENT' ? 'badge badge-green' : 'badge badge-teal'} style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                      {hosp.type.replace('_', ' ')}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', margin: '4px 0 2px', color: 'var(--text-main)' }}>
                      {hosp.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {hosp.city}, {hosp.state} • <strong>{hosp.distanceKm} km away</strong>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowScoreModal(hosp)}
                    style={{
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      border: '2px solid var(--medical-blue)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      textAlign: 'center'
                    }}
                    title="Click to view algorithm breakdown"
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Care Score</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--medical-blue)', lineHeight: 1 }}>{hosp.chikitsaCareScore}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--medical-teal)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Info size={10} /> Why?
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', margin: '12px 0', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    ICU: {hosp.bedTelemetry.icuAvailable} Free
                  </span>
                  <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                    Ventilator: {hosp.bedTelemetry.ventilatorAvailable} Free
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                    Oxygen: {hosp.bedTelemetry.oxygenBedsAvailable} Free
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Empaneled Schemes:</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {hosp.acceptedGovSchemes.map((s, idx) => (
                      <span key={idx} style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.72rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                  onClick={() => handleDispatchAmbulance(hosp)}
                  className="btn btn-emergency btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🚑 {language === 'HI' ? 'इस अस्पताल से एम्बुलेंस बुलाएं' : 'Call ALS Ambulance From Here'}
                </button>
                <button
                  onClick={() => onSelectHospital(hosp)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Book OPD & Get Queue Token <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internal Ambulance Tracking Modal fallback if not handled by root */}
      {internalAmbulanceHospital && (
        <AmbulanceLiveTrackingModal
          language={language}
          targetHospital={internalAmbulanceHospital}
          onClose={() => setInternalAmbulanceHospital(null)}
        />
      )}

      {/* Care Score Algorithm Breakdown Modal */}
      {showScoreModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                Care Score Algorithm Breakdown: {showScoreModal.chikitsaCareScore}/100
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
                <strong>95 / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>3. Distance & Emergency Proximity (15% Weight)</span>
                <strong>90 / 100 ({showScoreModal.distanceKm} km)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>4. ICU & Ventilator Bed Availability (15% Weight)</span>
                <strong>92 / 100</strong>
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
