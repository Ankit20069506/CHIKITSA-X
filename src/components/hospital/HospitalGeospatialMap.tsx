import React, { useState, useRef, useMemo } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import {
  MapPin,
  Navigation,
  Plus,
  Minus,
  Crosshair,
  Search,
  Building2,
  Phone,
  Calendar,
  Compass,
  Layers,
  ChevronRight,
  ExternalLink
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
  // User's reference location (Baner / Pune: 18.5582° N, 73.7806° E)
  const userLocation = { lat: 18.5582, lng: 73.7806, label: 'Your Location (Baner, Pune)' };

  // Map state: center coordinates and zoom level
  const [center, setCenter] = useState<{ lat: number; lng: number }>(userLocation);
  const [zoom, setZoom] = useState<number>(13);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(20);
  const [mapType, setMapType] = useState<'STREET' | 'TERRAIN'>('STREET');

  // Drag pan state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Geographic bounds conversion to canvas/SVG coordinates
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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesCity = h.city.toLowerCase().includes(q);
        const matchesSpecialty = h.opdDepartments?.some(d => d.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesSpecialty) return false;
      }
      return true;
    });
  }, [hospitals, radiusFilterKm, searchQuery]);

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

    // Convert pixel offset to lat/lng degrees
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
  const height = 500;
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
      {/* Top Map Toolbar: Normal Search & Map Controls */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        zIndex: 10
      }}>
        {/* Title and Location Badge */}
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
            <MapPin size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
              {language === 'HI' ? 'अस्पताल जियोस्पेशियल लोकेशन मैप' : 'Hospital Geospatial Location Map'}
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              📍 18.5582° N, 73.7806° E (Baner, Pune) • {visibleHospitals.length} {language === 'HI' ? 'अस्पताल उपलब्ध' : 'hospitals in area'}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={language === 'HI' ? 'अस्पताल या विभाग खोजें...' : 'Search hospital or specialty...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>

        {/* Filters and Normal Map Mode */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Radius selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Radius:</span>
            {[5, 10, 20].map(rad => (
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

          {/* Map Type: Normal Street vs Terrain */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              onClick={() => setMapType('STREET')}
              className={mapType === 'STREET' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              Street
            </button>
            <button
              onClick={() => setMapType('TERRAIN')}
              className={mapType === 'TERRAIN' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              Terrain
            </button>
          </div>
        </div>
      </div>

      {/* Normal Geospatial Map Canvas */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '500px',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: mapType === 'STREET' ? '#f8fafc' : '#f1f5f9',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* SVG Normal Map Layer */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Background Map Canvas / Ground */}
          <rect width="100%" height="100%" fill={mapType === 'STREET' ? '#f8fafc' : '#eef2f6'} />

          {/* Green Parks / Forests (Baner Biodiversity Park & Pashan Hills) */}
          <path
            d={`M ${width * 0.05} ${height * 0.1} Q ${width * 0.2} ${height * 0.05} ${width * 0.28} ${height * 0.25} T ${width * 0.15} ${height * 0.4} Z`}
            fill="#dcfce7"
            stroke="#bbf7d0"
            strokeWidth="1"
          />
          <text x={width * 0.12} y={height * 0.22} fill="#15803d" fontSize="10" fontWeight="600">
            Baner Biodiversity Park
          </text>

          <path
            d={`M ${width * 0.7} ${height * 0.65} Q ${width * 0.85} ${height * 0.6} ${width * 0.95} ${height * 0.8} T ${width * 0.8} ${height * 0.95} Z`}
            fill="#dcfce7"
            stroke="#bbf7d0"
            strokeWidth="1"
          />
          <text x={width * 0.78} y={height * 0.78} fill="#15803d" fontSize="10" fontWeight="600">
            Vetal Tekdi Nature Reserve
          </text>

          {/* Water Bodies (Mula-Mutha River & Pashan Lake) */}
          <path
            d={`M 0 ${height * 0.38} Q ${width * 0.3} ${height * 0.45} ${width * 0.55} ${height * 0.35} T ${width} ${height * 0.42}`}
            fill="none"
            stroke="#bae6fd"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={`M 0 ${height * 0.38} Q ${width * 0.3} ${height * 0.45} ${width * 0.55} ${height * 0.35} T ${width} ${height * 0.42}`}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="4"
          />
          <text x={width * 0.42} y={height * 0.39} fill="#0284c7" fontSize="10" fontStyle="italic">
            ~ Mula River ~
          </text>

          {/* City Road Network (Clean Standard Cartography) */}
          {/* Minor Roads */}
          <g stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={`M ${width * 0.15} ${height * 0.15} L ${width * 0.85} ${height * 0.15}`} />
            <path d={`M ${width * 0.1} ${height * 0.7} L ${width * 0.9} ${height * 0.7}`} />
            <path d={`M ${width * 0.35} ${height * 0.1} L ${width * 0.35} ${height * 0.9}`} />
            <path d={`M ${width * 0.65} ${height * 0.1} L ${width * 0.65} ${height * 0.9}`} />
            <path d={`M ${width * 0.2} ${height * 0.5} Q ${width * 0.5} ${height * 0.6} ${width * 0.8} ${height * 0.5}`} />
          </g>

          {/* Secondary Arterials */}
          <g stroke="#cbd5e1" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Baner Road */}
            <path d={`M ${width * 0.2} ${height * 0.75} L ${width * 0.65} ${height * 0.25}`} />
            {/* Pashan-Sus Link Road */}
            <path d={`M ${width * 0.15} ${height * 0.35} Q ${width * 0.45} ${height * 0.45} ${width * 0.75} ${height * 0.65}`} />
          </g>

          {/* Primary Highway: NH-48 Pune Bypass (Golden / Amber Road) */}
          <g stroke="#fde68a" strokeWidth="8" fill="none" strokeLinecap="round">
            <path d={`M ${width * 0.08} ${height * 0.92} Q ${width * 0.42} ${height * 0.52} ${width * 0.88} ${height * 0.08}`} />
          </g>
          <g stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,6" fill="none">
            <path d={`M ${width * 0.08} ${height * 0.92} Q ${width * 0.42} ${height * 0.52} ${width * 0.88} ${height * 0.08}`} />
          </g>

          {/* Road & Neighborhood Labels (Google Maps style) */}
          <text x={width * 0.52} y={height * 0.32} fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="0.05em">
            NH-48 PUNE BYPASS
          </text>
          <text x={width * 0.28} y={height * 0.6} fill="#64748b" fontSize="10">
            Baner Main Road
          </text>

          {/* Local Area Names */}
          <text x={width * 0.22} y={height * 0.28} fill="#64748b" fontSize="12" fontWeight="700">
            BANER
          </text>
          <text x={width * 0.38} y={height * 0.7} fill="#64748b" fontSize="12" fontWeight="700">
            PASHAN
          </text>
          <text x={width * 0.68} y={height * 0.3} fill="#64748b" fontSize="12" fontWeight="700">
            AUNDH
          </text>
          <text x={width * 0.75} y={height * 0.85} fill="#64748b" fontSize="12" fontWeight="700">
            SHIVAJINAGAR
          </text>

          {/* Normal Driving Route Line when a Hospital is Selected */}
          {selectedHospital && (() => {
            const hospPx = projectToPixels(
              selectedHospital.mapsCoord.lat,
              selectedHospital.mapsCoord.lng,
              width,
              height
            );
            return (
              <g>
                {/* Route shadow */}
                <line
                  x1={userPx.x}
                  y1={userPx.y}
                  x2={hospPx.x}
                  y2={hospPx.y}
                  stroke="rgba(37, 99, 235, 0.2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Clean Google Maps blue navigation route */}
                <line
                  x1={userPx.x}
                  y1={userPx.y}
                  x2={hospPx.x}
                  y2={hospPx.y}
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                />
                {/* Distance Badge */}
                <rect
                  x={(userPx.x + hospPx.x) / 2 - 28}
                  y={(userPx.y + hospPx.y) / 2 - 12}
                  width="56"
                  height="22"
                  rx="6"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                />
                <text
                  x={(userPx.x + hospPx.x) / 2}
                  y={(userPx.y + hospPx.y) / 2 + 3}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {selectedHospital.distanceKm} km
                </text>
              </g>
            );
          })()}

          {/* Hospital Location Pins (Normal Google Maps Style Teardrop Markers) */}
          {visibleHospitals.map(hosp => {
            const pos = projectToPixels(hosp.mapsCoord.lat, hosp.mapsCoord.lng, width, height);
            const isSelected = selectedHospital?.id === hosp.id;
            const isGov = hosp.type === 'GOVERNMENT';
            const isCharity = hosp.type === 'CHARITABLE_TRUST';
            // Classic Clean Marker Colors
            const pinFill = isGov ? '#059669' : isCharity ? '#7c3aed' : '#0284c7';

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
                {/* Ground Marker Shadow */}
                <ellipse cx="0" cy="2" rx={isSelected ? 14 : 10} ry={isSelected ? 6 : 4} fill="rgba(0,0,0,0.2)" />

                {/* Classic Google Maps Teardrop Pin */}
                <g transform={isSelected ? 'scale(1.2) translate(0, -22)' : 'translate(0, -20)'}>
                  {/* Pin Body */}
                  <path
                    d="M 0 0 C -12 -12, -12 -26, 0 -26 C 12 -26, 12 -12, 0 0 Z"
                    fill={pinFill}
                    stroke="#ffffff"
                    strokeWidth="2"
                    filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
                  />
                  {/* Inner White Dot with Medical Cross */}
                  <circle cx="0" cy="-15" r="7" fill="#ffffff" />
                  <path
                    d="M -3 -15 L 3 -15 M 0 -18 L 0 -12"
                    stroke={pinFill}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                {/* Clean Hospital Name Label */}
                <rect
                  x="-55"
                  y={isSelected ? 8 : 4}
                  width="110"
                  height="18"
                  rx="4"
                  fill="#ffffff"
                  stroke={isSelected ? pinFill : '#cbd5e1'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                />
                <text
                  x="0"
                  y={isSelected ? 20 : 16}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="9.5"
                  fontWeight={isSelected ? '700' : '600'}
                >
                  {hosp.name.split(' ')[0]} ({hosp.distanceKm}k)
                </text>
              </g>
            );
          })}

          {/* Normal User Location Pin (Google Maps Style Blue Dot) */}
          <g transform={`translate(${userPx.x}, ${userPx.y})`}>
            {/* Soft static blue halo */}
            <circle cx="0" cy="0" r="16" fill="rgba(37, 99, 235, 0.2)" />
            {/* Inner solid blue dot */}
            <circle cx="0" cy="0" r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            {/* "You" Tag */}
            <rect
              x="-40"
              y="-26"
              width="80"
              height="18"
              rx="4"
              fill="#1e293b"
              stroke="#ffffff"
              strokeWidth="1"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text x="0" y="-14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
              📍 You Are Here
            </text>
          </g>
        </svg>

        {/* Map Control Buttons: Zoom In, Zoom Out, Recenter */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 20
        }}>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 1, 16))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: '#ffffff',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            title="Zoom In"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: '#ffffff',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={handleCenterUser}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: '1px solid #0284c7',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
            }}
            title="Center on My Location"
          >
            <Crosshair size={16} />
          </button>
        </div>

        {/* Normal Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.72rem',
          color: '#334155',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0284c7' }} />
            <span>Private Empanelled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#059669' }} />
            <span>Govt Apex (AIIMS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#7c3aed' }} />
            <span>Trust / NGO</span>
          </div>
        </div>

        {/* Selected Hospital Location Card Popup */}
        {selectedHospital && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '330px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: '16px',
            zIndex: 30,
            color: '#1e293b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{
                  background: selectedHospital.type === 'GOVERNMENT' ? '#dcfce7' : '#e0f2fe',
                  color: selectedHospital.type === 'GOVERNMENT' ? '#15803d' : '#0369a1',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {selectedHospital.type.replace('_', ' ')}
                </span>
                <h4 style={{ margin: '6px 0 2px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedHospital.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedHospital.city} • <strong>{selectedHospital.distanceKm} km driving distance</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: '2px' }}
              >
                ✕
              </button>
            </div>

            {/* Bed telemetry pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '10px 0', fontSize: '0.74rem' }}>
              <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>ICU Beds: </span>
                <strong style={{ color: selectedHospital.bedTelemetry.icuAvailable > 0 ? '#16a34a' : '#dc2626' }}>
                  {selectedHospital.bedTelemetry.icuAvailable} Free
                </strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Ventilator: </span>
                <strong style={{ color: '#0284c7' }}>
                  {selectedHospital.bedTelemetry.ventilatorAvailable} Free
                </strong>
              </div>
            </div>

            {/* Schemes */}
            <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '12px' }}>
              <strong>Empanelled:</strong> {selectedHospital.acceptedGovSchemes.slice(0, 2).join(', ')}
            </div>

            {/* Actions: OPD Booking & Ambulance Live Tracking */}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button
                onClick={() => onCallAmbulance(selectedHospital)}
                className="btn btn-emergency btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                title="Opens real-time animated GPS ambulance tracking"
              >
                🚑 {language === 'HI' ? 'एम्बुलेंस बुलाएं (लाइव ट्रैकिंग शुरू करें)' : 'Call Ambulance (Track Live on GPS)'}
              </button>
              <button
                onClick={() => onSelectHospital(selectedHospital)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
              >
                <Calendar size={13} /> {language === 'HI' ? 'ओपीडी टोकन बुक करें' : 'Book OPD Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
