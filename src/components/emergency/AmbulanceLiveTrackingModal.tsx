import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { db } from '../../db/database';
import {
  AlertOctagon,
  Phone,
  Navigation,
  CheckCircle2,
  Shield,
  Activity,
  Heart,
  Share2,
  Maximize2,
  Compass,
  Zap,
  Radio,
  Clock,
  MapPin,
  X,
  Copy,
  Info
} from 'lucide-react';

interface Props {
  language: AppLanguage;
  targetHospital?: Hospital | null;
  onClose: () => void;
}

export const AmbulanceLiveTrackingModal: React.FC<Props> = ({
  language,
  targetHospital: propHospital,
  onClose
}) => {
  const hospitals = db.getHospitals();
  // Default to nearest or provided hospital
  const targetHospital: Hospital = propHospital || hospitals[0];

  // User reference GPS location (Baner, Pune)
  const patientLocation = {
    lat: 18.5582,
    lng: 73.7806,
    address: 'Flat 402, Rohan Viti, Baner Pashan Link Rd, Pune'
  };

  // Hospital location
  const hospitalLocation = {
    lat: targetHospital.mapsCoord.lat,
    lng: targetHospital.mapsCoord.lng,
    name: targetHospital.name
  };

  // States
  const [countdown, setCountdown] = useState<number>(propHospital ? 0 : 5);
  const [isDispatched, setIsDispatched] = useState<boolean>(!!propHospital);
  const [progress, setProgress] = useState<number>(0.12); // 0.0 to 1.0
  const [etaSeconds, setEtaSeconds] = useState<number>(390); // ~6.5 mins
  const [currentSpeed, setCurrentSpeed] = useState<number>(62); // km/h
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showCPRGuide, setShowCPRGuide] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<'TACTICAL_RADAR' | 'SATELLITE_GIS'>('TACTICAL_RADAR');
  const [followAmbulance, setFollowAmbulance] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // SVG canvas dimensions
  const svgWidth = 840;
  const svgHeight = 440;

  // Waypoints for curved realistic road trajectory
  // From Hospital (Start: index 0) -> Waypoints -> Patient (End: index 4)
  const waypoints = useMemo(() => {
    // Canvas projection points
    const startX = 700;
    const startY = 100;
    const endX = 140;
    const endY = 320;

    return [
      { x: startX, y: startY, name: targetHospital.name.split(' ')[0] + ' Depot', lat: hospitalLocation.lat, lng: hospitalLocation.lng },
      { x: 550, y: 130, name: 'NH-48 Service Arterial', lat: 18.5350, lng: 73.8320 },
      { x: 420, y: 220, name: 'Pashan Circle Flyover', lat: 18.5420, lng: 73.8050 },
      { x: 260, y: 240, name: 'Baner Pashan Junction', lat: 18.5510, lng: 73.7910 },
      { x: endX, y: endY, name: 'Patient Spot (Baner)', lat: patientLocation.lat, lng: patientLocation.lng }
    ];
  }, [hospitalLocation.lat, hospitalLocation.lng, patientLocation.lat, patientLocation.lng, targetHospital.name]);

  // Construct SVG Bezier path string
  const routePathD = useMemo(() => {
    const [p0, p1, p2, p3, p4] = waypoints;
    return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y} S ${p4.x - 30} ${p4.y - 20}, ${p4.x} ${p4.y}`;
  }, [waypoints]);

  // Hidden path element ref for SVG point calculation
  const pathRef = useRef<SVGPathElement>(null);

  // Calculate position & heading angle along route based on progress
  const vehiclePos = useMemo(() => {
    if (!pathRef.current) {
      // Fallback linear interpolation
      const pStart = waypoints[0];
      const pEnd = waypoints[waypoints.length - 1];
      const x = pStart.x + (pEnd.x - pStart.x) * progress;
      const y = pStart.y + (pEnd.y - pStart.y) * progress;
      return { x, y, angle: 215, lat: 18.542, lng: 73.805 };
    }

    try {
      const totalLen = pathRef.current.getTotalLength();
      const currentLen = totalLen * Math.min(Math.max(progress, 0.01), 0.99);
      const pt = pathRef.current.getPointAtLength(currentLen);
      const nextPt = pathRef.current.getPointAtLength(Math.min(currentLen + 5, totalLen));

      // Calculate angle in degrees
      const dx = nextPt.x - pt.x;
      const dy = nextPt.y - pt.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Lat/Lng interpolation
      const currLat = hospitalLocation.lat + (patientLocation.lat - hospitalLocation.lat) * progress;
      const currLng = hospitalLocation.lng + (patientLocation.lng - hospitalLocation.lng) * progress;

      return { x: pt.x, y: pt.y, angle, lat: currLat, lng: currLng };
    } catch {
      return { x: 400, y: 200, angle: 210, lat: 18.542, lng: 73.805 };
    }
  }, [progress, waypoints, hospitalLocation, patientLocation]);

  // Initial countdown timer
  useEffect(() => {
    if (countdown > 0 && !isDispatched) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isDispatched) {
      setIsDispatched(true);
    }
  }, [countdown, isDispatched]);

  // Live simulation tick: Vehicle movement, ETA decrement, Speed fluctuations
  useEffect(() => {
    if (!isDispatched) return;

    const interval = setInterval(() => {
      // Advance progress smoothly towards destination
      setProgress(prev => {
        if (prev >= 0.95) return 0.95; // Arrived / holding nearby
        return prev + 0.008;
      });

      // Decrement ETA seconds
      setEtaSeconds(prev => {
        if (prev <= 30) return 30; // Minimum 30s once arriving
        return prev - 1;
      });

      // Fluctuate speed realistically
      setCurrentSpeed(prev => {
        const jitter = Math.floor(Math.random() * 7) - 3;
        const newSpeed = prev + jitter;
        return Math.min(Math.max(newSpeed, 48), 74);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isDispatched]);

  // Calculate dynamic telemetry
  const remainingDistanceKm = useMemo(() => {
    const baseDist = targetHospital.distanceKm || 4.2;
    const rem = baseDist * (1 - progress);
    return Math.max(rem, 0.2).toFixed(1);
  }, [targetHospital.distanceKm, progress]);

  const formattedEta = useMemo(() => {
    const mins = Math.floor(etaSeconds / 60);
    const secs = etaSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [etaSeconds]);

  const handleCopyTrackingLink = () => {
    navigator.clipboard?.writeText?.('https://chikitsax.gov.in/sos/track?id=MH-12-QX-4019&unit=ALS-04');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          padding: 0,
          maxWidth: '920px',
          width: '95vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid var(--emergency-red)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.35)'
        }}
      >
        {/* Top Emergency Status Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.9)',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <AlertOctagon size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#ffffff',
                    color: '#991b1b',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.05em'
                  }}
                >
                  LIVE GPS TELEMETRY
                </span>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {language === 'HI' ? 'आपातकालीन एम्बुलेंस लाइव ट्रैकिंग' : 'EMERGENCY ALS AMBULANCE LIVE TRACKING'}
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#fecaca', margin: '2px 0 0' }}>
                Unit: <strong style={{ color: '#ffffff' }}>MH-12-QX-4019 (ALS Unit #4)</strong> • Destination: <strong style={{ color: '#ffffff' }}>{targetHospital.name}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyTrackingLink}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '0.75rem'
              }}
              title="Share Live Tracking with Family"
            >
              <Share2 size={13} /> {isCopied ? (language === 'HI' ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (language === 'HI' ? 'शेयर करें' : 'Share SOS')}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px', background: 'var(--bg-primary)' }}>
          {/* If still in countdown phase */}
          {!isDispatched ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {language === 'HI' ? 'उन्नत लाइफ सपोर्ट (ALS) एम्बुलेंस रवाना होने में शेष:' : 'AUTO-DISPATCHING ADVANCED LIFE SUPPORT (ALS) IN:'}
              </div>
              <div style={{ fontSize: '5.5rem', fontWeight: 900, color: 'var(--emergency-red)', lineHeight: 1, margin: '10px 0' }}>
                {countdown}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px' }}>
                {language === 'HI'
                  ? `निकटतम ट्रॉमा सेंटर (${targetHospital.name}) व आपातकालीन संपर्क 98201 54821 को लाइव जीपीएस लोकेशन प्रसारित की जा रही है।`
                  : `Broadcasting patient live coordinates (18.5582° N, 73.7806° E) to nearest trauma ICU at ${targetHospital.name} and registered kin.`}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsDispatched(true)}
                  className="btn btn-emergency btn-lg"
                  style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}
                >
                  <Zap size={18} /> {language === 'HI' ? 'तुरंत अभी रवाना करें!' : 'Dispatch Immediately Now!'}
                </button>
                <button onClick={onClose} className="btn btn-secondary btn-lg">
                  {language === 'HI' ? 'गलत अलार्म रद्द करें' : 'Cancel False Alarm'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Telemetry Metric Ribbons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px'
                }}
              >
                {/* ETA Metric */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1px solid var(--success-emerald)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--success-emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {language === 'HI' ? 'अनुमानित आगमन (ETA)' : 'ESTIMATED ARRIVAL'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success-emerald)', lineHeight: 1.1 }}>
                      {formattedEta} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>MINS</span>
                    </div>
                  </div>
                </div>

                {/* Distance Metric */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <Navigation size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {language === 'HI' ? 'दूरी शेष' : 'DISTANCE REMAINING'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', lineHeight: 1.1 }}>
                      {remainingDistanceKm} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>KM</span>
                    </div>
                  </div>
                </div>

                {/* Speed Telemetry */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#9333ea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <Activity size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {language === 'HI' ? 'वाहन गति (स्पीड)' : 'TRANSIT SPEED'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#9333ea', lineHeight: 1.1 }}>
                      {currentSpeed} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>KM/H</span>
                    </div>
                  </div>
                </div>

                {/* Corridor Status */}
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid #0284c7',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    <Radio size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {language === 'HI' ? 'ट्रैफिक ग्रीन कॉरिडोर' : 'CORRIDOR STATUS'}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                      🟢 ACTIVE PREEMPTION
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Geospatial Map Canvas */}
              <div
                style={{
                  background: mapTheme === 'TACTICAL_RADAR' ? '#070b14' : '#0f172a',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 10px 25px -5px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '18px'
                }}
              >
                {/* Map Control Overlay Header */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    right: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 20,
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.74rem',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      pointerEvents: 'auto'
                    }}
                  >
                    <Radio size={14} className="animate-pulse" />
                    <strong>GPS COORDINATES:</strong>
                    <span>{vehiclePos.lat.toFixed(4)}° N, {vehiclePos.lng.toFixed(4)}° E</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
                    <button
                      onClick={() => setMapTheme(prev => prev === 'TACTICAL_RADAR' ? 'SATELLITE_GIS' : 'TACTICAL_RADAR')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(15, 23, 42, 0.85)' }}
                    >
                      {mapTheme === 'TACTICAL_RADAR' ? '🛰️ Satellite' : '🎯 Tactical Radar'}
                    </button>
                    <button
                      onClick={() => setFollowAmbulance(!followAmbulance)}
                      className={followAmbulance ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    >
                      <Compass size={12} /> {followAmbulance ? 'Tracking Ambulance' : 'Free View'}
                    </button>
                  </div>
                </div>

                {/* SVG Visual Map Canvas */}
                <svg
                  width="100%"
                  height="380"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ display: 'block', width: '100%', height: '380px' }}
                >
                  <defs>
                    {/* Dark Tactical Grid */}
                    <pattern id="nightGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="1" />
                    </pattern>

                    {/* Gradient for en-route path */}
                    <linearGradient id="routeGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>

                    {/* Ambulance beacon wave */}
                    <radialGradient id="ambulanceGlow">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>

                    {/* Patient beacon wave */}
                    <radialGradient id="patientGlow">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Base Radar Grid */}
                  <rect width="100%" height="100%" fill="url(#nightGrid)" />

                  {/* Road Network & City Arteries */}
                  <g stroke="#1e293b" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85">
                    <path d="M 50 180 L 800 180" /> {/* NH48 Bypass */}
                    <path d="M 120 40 L 120 400" /> {/* Baner Main Rd */}
                    <path d="M 400 40 L 400 400" strokeWidth="6" /> {/* Pashan Rd */}
                    <path d="M 680 40 L 680 400" strokeWidth="6" /> {/* University Rd */}
                    <circle cx="420" cy="220" r="45" stroke="#334155" strokeWidth="4" /> {/* Roundabout */}
                  </g>

                  {/* Road Street Names */}
                  <text x="430" y="170" fill="#475569" fontSize="11" fontFamily="sans-serif" letterSpacing="0.05em">
                    NH-48 PASHAN ARTERIAL HIGHWAY (GREEN CORRIDOR)
                  </text>
                  <text x="135" y="100" fill="#475569" fontSize="10" fontFamily="sans-serif">
                    BANER PASHAN LINK ROAD
                  </text>

                  {/* Preemption Signals along the path */}
                  {[
                    { x: 550, y: 130, label: 'Sig-01: GREEN' },
                    { x: 420, y: 220, label: 'Sig-02: GREEN' },
                    { x: 260, y: 240, label: 'Sig-03: GREEN' }
                  ].map((sig, idx) => (
                    <g key={idx} transform={`translate(${sig.x}, ${sig.y - 14})`}>
                      <circle cx="0" cy="0" r="5" fill="#10b981">
                        <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                      </circle>
                      <text x="8" y="3" fill="#10b981" fontSize="9" fontWeight="700">
                        {sig.label}
                      </text>
                    </g>
                  ))}

                  {/* Active Road Trajectory Path */}
                  <path
                    ref={pathRef}
                    d={routePathD}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="8,6"
                  />

                  {/* Hospital Origin Marker */}
                  <g transform={`translate(${waypoints[0].x}, ${waypoints[0].y})`}>
                    <circle cx="0" cy="0" r="22" fill="rgba(2, 132, 199, 0.2)" />
                    <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                      🏥
                    </text>
                    {/* Hospital Name Flag */}
                    <rect x="-70" y="-36" width="140" height="22" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                    <text x="0" y="-21" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                      {targetHospital.name.split(' ')[0]} Hospital
                    </text>
                  </g>

                  {/* Patient Destination Marker (You) */}
                  <g transform={`translate(${waypoints[waypoints.length - 1].x}, ${waypoints[waypoints.length - 1].y})`}>
                    {/* Pulsing beacon */}
                    <circle cx="0" cy="0" r="36" fill="url(#patientGlow)">
                      <animate attributeName="r" values="16;42;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="0" cy="0" r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="5" fill="#ffffff" />
                    {/* Patient Pin Banner */}
                    <rect x="-60" y="-38" width="120" height="22" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                    <text x="0" y="-23" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                      📍 YOU (PATIENT SPOT)
                    </text>
                  </g>

                  {/* Dynamic Moving Ambulance Unit */}
                  <g
                    transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}
                    style={{ transition: 'transform 0.8s ease-out' }}
                  >
                    {/* Flashing Emergency Lightbar Wave */}
                    <circle cx="0" cy="0" r="28" fill="url(#ambulanceGlow)">
                      <animate attributeName="r" values="14;34;14" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1s" repeatCount="indefinite" />
                    </circle>

                    {/* Strobe Beacons Red/Blue */}
                    <circle cx="-12" cy="-14" r="4" fill="#ef4444">
                      <animate attributeName="opacity" values="1;0.1;1" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="12" cy="-14" r="4" fill="#38bdf8">
                      <animate attributeName="opacity" values="0.1;1;0.1" dur="0.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Ambulance Vehicle Body Badge */}
                    <g transform={`rotate(${vehiclePos.angle})`}>
                      <rect
                        x="-18"
                        y="-12"
                        width="36"
                        height="24"
                        rx="6"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))"
                      />
                      <rect x="-10" y="-4" width="20" height="8" rx="2" fill="#ffffff" />
                      {/* Red cross on vehicle */}
                      <path d="M 0 -2 L 0 2 M -2 0 L 2 0" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Unit Callout Label */}
                    <rect
                      x="-55"
                      y="-40"
                      width="110"
                      height="20"
                      rx="6"
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth="1.5"
                    />
                    <text x="0" y="-26" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">
                      🚑 ALS-04 (MH-12-QX)
                    </text>
                  </g>
                </svg>

                {/* Bottom Route Telemetry Bar */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    padding: '10px 18px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: '#cbd5e1'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="#38bdf8" />
                    <span>
                      {language === 'HI' ? 'रूट:' : 'Route:'} <strong>Via Pashan Flyover & Baner Link Rd</strong> (Pune Traffic Police Smart Signal Green Corridor Synchronized)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> {language === 'HI' ? 'ट्रैफिक जाम: 0%' : 'Zero Delays'}
                    </span>
                    <span style={{ color: '#f59e0b' }}>
                      ⚡ 100% Signal Override
                    </span>
                  </div>
                </div>
              </div>

              {/* Trauma ICU Reservation & Paramedic Crew Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '14px',
                  marginBottom: '18px'
                }}
              >
                {/* Paramedic & Driver Card */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {language === 'HI' ? 'तैनात एम्बुलेंस कर्मी दल' : 'ASSIGNED PARAMEDIC CREW'}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                        Vikram Jadhav (Driver) • Sr. Kavita (ALS)
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                      4.9 ★ (820+ Trips)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                    <div>🚑 <strong>Vehicle:</strong> Force Traveller Type-D Cardiac Ambulance</div>
                    <div>🩺 <strong>Onboard:</strong> Hamilton Transport Ventilator, Zoll AED Defibrillator, Syringe Pump, High-Flow O2</div>
                    <div>📞 <strong>Direct Contact:</strong> +91 98812 33412 (Mobile Link Open)</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href="tel:9881233412"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Phone size={14} /> {language === 'HI' ? 'ड्राइवर को कॉल करें' : 'Call Driver'}
                    </a>
                    <a
                      href="tel:108"
                      className="btn btn-emergency btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Phone size={14} /> 108 Central
                    </a>
                  </div>
                </div>

                {/* Destination Trauma Bed Pre-allocation */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
                          DESTINATION TRAUMA ICU
                        </span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {targetHospital.name}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RESERVED BED</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7' }}>#ICU-T04</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      📍 {targetHospital.city} • Contact: {targetHospital.contactNumber}<br />
                      👨‍⚕️ Emergency On-Duty: <strong>Dr. R. Sen (Chief of Emergency Medicine)</strong> alerted with patient ABHA profile & symptom history.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setShowCPRGuide(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Heart size={14} color="#ef4444" /> {language === 'HI' ? 'फर्स्ट एड / सीपीआर निर्देश' : 'First Aid & CPR Guide'}
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${patientLocation.lat},${patientLocation.lng}&destination=${hospitalLocation.lat},${hospitalLocation.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-teal btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Navigation size={14} /> Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CPR / First-Aid Modal Popup */}
          {showCPRGuide && (
            <div className="modal-overlay" style={{ zIndex: 10005 }}>
              <div className="modal-content" style={{ maxWidth: '540px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={24} color="#ef4444" />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ef4444' }}>
                      {language === 'HI' ? 'आपातकालीन प्राथमिक चिकित्सा एवं सीपीआर (CPR)' : 'Immediate First Aid & CPR Protocol'}
                    </h3>
                  </div>
                  <button onClick={() => setShowCPRGuide(false)} className="btn btn-secondary btn-sm">✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <strong>1. Check Responsiveness & Breathing:</strong><br />
                    Gently tap the patient shoulders and ask loudly, &quot;Are you OK?&quot; Look for normal chest rise.
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                    <strong>2. High-Quality Chest Compressions:</strong><br />
                    Place interlocked hands in center of chest. Push hard and fast (100–120 beats/min, to rhythm of &apos;Stayin Alive&apos;), allowing full chest recoil.
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <strong>3. Clear Airway & Keep Patient Warm:</strong><br />
                    Loosen tight clothing around neck. If breathing, turn patient gently onto their left side (Recovery Position) to avoid aspiration.
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', color: '#ef4444', fontWeight: 600 }}>
                    ⚠️ Ambulance is {remainingDistanceKm} km away ({formattedEta} mins). Paramedics are in direct transit. Keep phone line free.
                  </div>
                </div>

                <button
                  onClick={() => setShowCPRGuide(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  Return to Live Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
