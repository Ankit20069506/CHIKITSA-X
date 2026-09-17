import React, { useState, useRef, useMemo } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import {
  MapPin,
  Navigation,
  Plus,
  Minus,
  Crosshair,
  Shield,
  Activity,
  Phone,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter
} from 'lucide-react';

interface Props {
  language: AppLanguage;
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onCallAmbulance: (hospital: Hospital) => void;
}

export const HospitalGeospatialMap: React.FC<Props> = ({
  language,
  hospitals,
  onSelectHospital,
  onCallAmbulance
}) => {
  // User's reference GPS location (Baner / Pune: 18.5582° N, 73.7806° E)
  const userLocation = { lat: 18.5582, lng: 73.7806 };

  // Map viewport state: center coordinates and zoom level
  const [center, setCenter] = useState<{ lat: number; lng: number }>(userLocation);
  const [zoom, setZoom] = useState<number>(13);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(15);
  const [filterOnlyICU, setFilterOnlyICU] = useState<boolean>(false);
  const [filterOnlyEmergency, setFilterOnlyEmergency] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'TACTICAL_DARK' | 'STREET_LIGHT' | 'SATELLITE'>('TACTICAL_DARK');

  // Drag pan state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Geographic bounds conversion to canvas/SVG coordinates
  // Scale factor: degrees to pixels based on zoom level
  const pixelsPerDegree = Math.pow(2, zoom) * 20;

  const projectToPixels = (lat: number, lng: number, width: number, height: number) => {
    // Mercator-like projection relative to viewport center
    const x = width / 2 + (lng - center.lng) * pixelsPerDegree * 1.05;
    const y = height / 2 - (lat - center.lat) * pixelsPerDegree;
    return { x, y };
  };

  // Filter hospitals
  const visibleHospitals = useMemo(() => {
    return hospitals.filter(h => {
      if (h.distanceKm > radiusFilterKm) return false;
      if (filterOnlyICU && h.bedTelemetry.icuAvailable <= 0) return false;
      if (filterOnlyEmergency && !h.emergency24x7) return false;
      return true;
    });
  }, [hospitals, radiusFilterKm, filterOnlyICU, filterOnlyEmergency]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Invert pixel offset to lat/lng degrees
    const deltaLng = -dx / (pixelsPerDegree * 1.05);
    const deltaLat = dy / pixelsPerDegree;

    setCenter(prev => ({
      lat: prev.lat + deltaLat,
      lng: prev.lng + deltaLng
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCenterUser = () => {
    setCenter(userLocation);
    setZoom(13);
  };

  const width = 800;
  const height = 520;
  const userPx = projectToPixels(userLocation.lat, userLocation.lng, width, height);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-md)',
      position: 'relative'
    }}>
      {/* Top Map Control Bar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Navigation size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              {language === 'HI' ? 'लाइव जियोस्पेशियल अस्पताल रडार मैप' : 'Live Geospatial Hospital Radar Map'}
            </h3>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              GPS: <strong style={{ color: 'var(--medical-blue)' }}>18.5582° N, 73.7806° E</strong> (Baner, Pune) • {visibleHospitals.length} Facilities within {radiusFilterKm} km
            </div>
          </div>
        </div>

        {/* Filters and Layer Toggles */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Radius selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Radius:</span>
            {[5, 10, 15, 25].map(rad => (
              <button
                key={rad}
                onClick={() => setRadiusFilterKm(rad)}
                className={radiusFilterKm === rad ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
              >
                {rad} km
              </button>
            ))}
          </div>

          {/* Map theme */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setMapStyle('TACTICAL_DARK')}
              className={mapStyle === 'TACTICAL_DARK' ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              Dark Radar
            </button>
            <button
              onClick={() => setMapStyle('STREET_LIGHT')}
              className={mapStyle === 'STREET_LIGHT' ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              Day Street
            </button>
          </div>

          {/* ICU toggle */}
          <button
            onClick={() => setFilterOnlyICU(!filterOnlyICU)}
            className={filterOnlyICU ? 'btn btn-teal btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
          >
            ICU Available
          </button>
        </div>
      </div>

      {/* Geospatial Canvas / SVG Map Container */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '520px',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: mapStyle === 'TACTICAL_DARK' ? '#080d1a' : '#f1f5f9',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* SVG Map Canvas with Roads, Grids, and Markers */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={mapStyle === 'TACTICAL_DARK' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
                strokeWidth="1"
              />
            </pattern>

            {/* Pulsing Beacon Animation */}
            <radialGradient id="beaconPulse">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#radarGrid)" />

          {/* Simulated Geographic Roads & Arteries */}
          <g stroke={mapStyle === 'TACTICAL_DARK' ? '#1e293b' : '#cbd5e1'} strokeWidth="4" fill="none" opacity="0.7">
            {/* NH 48 Pune-Mumbai Highway */}
            <path d={`M ${width * 0.1} ${height * 0.9} Q ${width * 0.4} ${height * 0.5} ${width * 0.85} ${height * 0.1}`} strokeWidth="6" />
            {/* Baner Road */}
            <path d={`M ${width * 0.25} ${height * 0.75} L ${width * 0.65} ${height * 0.35}`} strokeWidth="4" />
            {/* Pashan-Sus Link Road */}
            <path d={`M ${width * 0.2} ${height * 0.3} Q ${width * 0.5} ${height * 0.45} ${width * 0.75} ${height * 0.65}`} strokeWidth="3" />
            {/* Ring Road */}
            <circle cx={width * 0.5} cy={height * 0.5} r={180} strokeDasharray="6,6" strokeWidth="2" />
          </g>

          {/* Radial Distance Rings around User Location */}
          {[60, 130, 210].map((r, i) => (
            <g key={r}>
              <circle
                cx={userPx.x}
                cy={userPx.y}
                r={r}
                fill="none"
                stroke={mapStyle === 'TACTICAL_DARK' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)'}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={userPx.x + r + 4}
                y={userPx.y - 4}
                fill={mapStyle === 'TACTICAL_DARK' ? '#64748b' : '#94a3b8'}
                fontSize="10"
                fontFamily="monospace"
              >
                {(i + 1) * 5} km
              </text>
            </g>
          ))}

          {/* Route Line if a hospital is selected */}
          {selectedHospital && (() => {
            const hospPx = projectToPixels(
              selectedHospital.mapsCoord.lat,
              selectedHospital.mapsCoord.lng,
              width,
              height
            );
            return (
              <g>
                <line
                  x1={userPx.x}
                  y1={userPx.y}
                  x2={hospPx.x}
                  y2={hospPx.y}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                />
                <circle cx={(userPx.x + hospPx.x) / 2} cy={(userPx.y + hospPx.y) / 2} r="12" fill="#0284c7" />
                <text
                  x={(userPx.x + hospPx.x) / 2}
                  y={(userPx.y + hospPx.y) / 2 + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {selectedHospital.distanceKm}k
                </text>
              </g>
            );
          })()}

          {/* Hospital Pins */}
          {visibleHospitals.map(hosp => {
            const pos = projectToPixels(hosp.mapsCoord.lat, hosp.mapsCoord.lng, width, height);
            const isSelected = selectedHospital?.id === hosp.id;
            const isGov = hosp.type === 'GOVERNMENT';
            const isCharity = hosp.type === 'CHARITABLE_TRUST';
            const pinColor = isGov ? '#10b981' : isCharity ? '#9333ea' : '#0284c7';

            return (
              <g
                key={hosp.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedHospital(hosp);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulsing Emergency Ring for 24x7 Facilities */}
                {hosp.emergency24x7 && (
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? '28' : '20'}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Pin Base Shadow */}
                <ellipse cx="0" cy="14" rx="10" ry="4" fill="rgba(0,0,0,0.4)" />

                {/* Pin Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? '18' : '15'}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Hospital Cross Icon */}
                <path
                  d="M -5 0 L 5 0 M 0 -5 L 0 5"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Care Score Pill on top */}
                <rect
                  x="-16"
                  y="-28"
                  width="32"
                  height="14"
                  rx="7"
                  fill="#0f172a"
                  stroke={pinColor}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-18"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  ★ {hosp.chikitsaCareScore}
                </text>

                {/* Hospital Name Label */}
                <text
                  x="0"
                  y="26"
                  textAnchor="middle"
                  fill={mapStyle === 'TACTICAL_DARK' ? '#e2e8f0' : '#1e293b'}
                  fontSize="10"
                  fontWeight="700"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {hosp.name.split(' ')[0]} ({hosp.distanceKm}km)
                </text>
              </g>
            );
          })}

          {/* User Live GPS Marker */}
          <g transform={`translate(${userPx.x}, ${userPx.y})`}>
            {/* Animated Radar Pulse */}
            <circle cx="0" cy="0" r="40" fill="url(#beaconPulse)">
              <animate attributeName="r" values="15;45;15" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.5s" repeatCount="indefinite" />
            </circle>

            <circle cx="0" cy="0" r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />

            {/* "You" Tag */}
            <rect x="-35" y="-28" width="70" height="16" rx="8" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="-17" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              YOU (Live GPS)
            </text>
          </g>
        </svg>

        {/* Map Control Buttons: Zoom In, Zoom Out, Center */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 20
        }}>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 1, 16))}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            title="Zoom In"
          >
            <Plus size={18} />
          </button>

          <button
            onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            title="Zoom Out"
          >
            <Minus size={18} />
          </button>

          <button
            onClick={handleCenterUser}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #0284c7',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}
            title="Center on My GPS Location"
          >
            <Crosshair size={18} />
          </button>
        </div>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.72rem',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 20
        }}>
          <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '2px' }}>MAP LEGEND</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
            <span>Private Empanelled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span>Government Apex (AIIMS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9333ea' }} />
            <span>Charitable Trust / NGO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #ef4444' }} />
            <span>24x7 Emergency Trauma</span>
          </div>
        </div>

        {/* Floating Selected Hospital Card Popup */}
        {selectedHospital && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '320px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            padding: '16px',
            zIndex: 30,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span className={selectedHospital.type === 'GOVERNMENT' ? 'badge badge-green' : 'badge badge-teal'} style={{ fontSize: '0.65rem' }}>
                  {selectedHospital.type.replace('_', ' ')}
                </span>
                <h4 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 800 }}>
                  {selectedHospital.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {selectedHospital.city} • <strong>{selectedHospital.distanceKm} km away</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                ✕
              </button>
            </div>

            {/* Bed telemetry pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '10px 0', fontSize: '0.74rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>ICU Beds: </span>
                <strong style={{ color: selectedHospital.bedTelemetry.icuAvailable > 0 ? '#10b981' : '#ef4444' }}>
                  {selectedHospital.bedTelemetry.icuAvailable} Free
                </strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ventilators: </span>
                <strong style={{ color: 'var(--medical-blue)' }}>
                  {selectedHospital.bedTelemetry.ventilatorAvailable} Free
                </strong>
              </div>
            </div>

            {/* Schemes */}
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <strong>Empanelled:</strong> {selectedHospital.acceptedGovSchemes.slice(0, 2).join(', ')}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button
                onClick={() => onCallAmbulance(selectedHospital)}
                className="btn btn-emergency btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🚑 Dispatch Ambulance to this Hospital
              </button>
              <button
                onClick={() => onSelectHospital(selectedHospital)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Calendar size={13} /> Book OPD Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
