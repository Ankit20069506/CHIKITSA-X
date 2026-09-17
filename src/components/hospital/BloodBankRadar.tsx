import React, { useState } from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { db } from '../../db/database';
import { Droplet, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
}

export const BloodBankRadar: React.FC<Props> = ({ language }) => {
  const hospitals = db.getHospitals();
  const [selectedHosp, setSelectedHosp] = useState<Hospital>(hospitals[0]);

  const handleBroadcastSOS = (group: string) => {
    confetti({ particleCount: 70, spread: 50 });
    alert(`EMERGENCY BLOOD BROADCAST: Urgent donor request for ${group} sent to 45 nearby registered voluntary donors!`);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Droplet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {language === 'HI' ? 'रीयल-टाइम ब्लड बैंक स्टॉक एवं आपातकालीन डोनर रडार' : 'Real-Time Blood Bank Inventory & Donor SOS Radar'}
              <span className="live-dot" style={{ backgroundColor: 'var(--emergency-red)' }} />
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Live blood units availability with instant emergency donor broadcast for rare blood groups
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {selectedHosp.bloodBankStock.map(b => (
          <div
            key={b.group}
            style={{
              background: 'var(--bg-secondary)',
              border: b.isCriticallyLow ? '2px solid var(--emergency-red)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Droplet size={14} color={b.isCriticallyLow ? 'var(--emergency-red)' : 'var(--medical-teal)'} />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{b.group}</span>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: b.isCriticallyLow ? 'var(--emergency-red)' : 'var(--medical-teal)', lineHeight: 1 }}>
              {b.units} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>units</span>
            </div>

            {b.isCriticallyLow ? (
              <button
                onClick={() => handleBroadcastSOS(b.group)}
                className="btn btn-emergency btn-sm"
                style={{ width: '100%', marginTop: '8px', fontSize: '0.7rem', padding: '4px 6px' }}
              >
                SOS Call
              </button>
            ) : (
              <div style={{ fontSize: '0.7rem', color: 'var(--success-emerald)', fontWeight: 700, marginTop: '8px' }}>
                AVAILABLE
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={16} color="var(--emergency-red)" />
        <span>Rare negative blood groups (O-, AB-) trigger automated SMS notification to empanelled voluntary Red Cross donors.</span>
      </div>
    </div>
  );
};
