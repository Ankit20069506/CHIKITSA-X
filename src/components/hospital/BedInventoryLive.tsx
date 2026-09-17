import React, { useState } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { db } from '../../db/database';
import { Bed } from 'lucide-react';

interface Props {
  language: AppLanguage;
}

export const BedInventoryLive: React.FC<Props> = ({ language }) => {
  const [hospitals] = useState<Hospital[]>(() => db.getHospitals());
  const [selectedHosp, setSelectedHosp] = useState<Hospital>(hospitals[0]);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
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
            <Bed size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {language === 'HI' ? 'अस्पताल बेड एवं आईसीयू रीयल-टाइम टेलीमेट्री' : 'Hospital Bed & Critical Care Real-Time Telemetry'}
              <span className="live-dot" />
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Live hospital bed telemetry across ICU, Ventilator, Oxygen, and General wards
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {hospitals.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHosp(h)}
              className={selectedHosp.id === h.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {h.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Viewing Telemetry for: <strong>{selectedHosp.name}</strong> • Updated: {selectedHosp.bedTelemetry.lastTelemetryPing}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: selectedHosp.bedTelemetry.icuAvailable > 0 ? '1px solid var(--border-subtle)' : '1px solid var(--emergency-red)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ICU Beds</span>
            <span className={selectedHosp.bedTelemetry.icuAvailable > 3 ? 'badge badge-green' : 'badge badge-amber'}>
              {selectedHosp.bedTelemetry.icuAvailable > 0 ? 'AVAILABLE' : 'FULL'}
            </span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--medical-blue)', lineHeight: 1.1 }}>
            {selectedHosp.bedTelemetry.icuAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {selectedHosp.bedTelemetry.icuTotal} Free</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            24/7 Intensivist On-Duty
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Invasive Ventilators</span>
            <span className="badge badge-teal">Critical Care</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--medical-teal)', lineHeight: 1.1 }}>
            {selectedHosp.bedTelemetry.ventilatorAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {selectedHosp.bedTelemetry.ventilatorTotal} Free</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Advanced ARDS Support
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Oxygen Piped Beds</span>
            <span className="badge badge-green">High Flow O2</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success-emerald)', lineHeight: 1.1 }}>
            {selectedHosp.bedTelemetry.oxygenBedsAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {selectedHosp.bedTelemetry.oxygenBedsTotal} Free</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Liquid Medical Oxygen (LMO) Tank Active
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>General / Semi-Private</span>
            <span className="badge badge-blue">Routine Ward</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {selectedHosp.bedTelemetry.generalBedsAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {selectedHosp.bedTelemetry.generalBedsTotal} Free</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PM-JAY Scheme General Empanelled
          </div>
        </div>
      </div>
    </div>
  );
};
