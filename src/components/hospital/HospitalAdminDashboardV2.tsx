import React, { useState } from 'react';
import type { AppLanguage } from '../../types';
import { Building2, QrCode, CheckCircle2 } from 'lucide-react';
import { BedInventoryLive } from './BedInventoryLive';
import { BloodBankRadar } from './BloodBankRadar';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
}

export const HospitalAdminDashboardV2: React.FC<Props> = ({ language }) => {
  const [tokenInput, setTokenInput] = useState('CHX-2026-8A92F');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerifyPass = () => {
    confetti({ particleCount: 70, spread: 60 });
    setVerificationResult('SUCCESS: Reference ID CHX-2026-8A92F verified. Patient Ankit Patel checked-in for Cardiology OPD #04.');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Priya Sharma (Hospital Admin Desk)</h1>
              <span className="badge badge-orange">COMMAND CENTER</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              CarePlus Tertiary Heart Hospital • Reception, Bed Telemetry & PM-JAY Helpdesk
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={20} color="var(--abdm-orange)" />
          Digital OPD Pass Verification & Patient Check-In
        </h3>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <input
            type="text"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="Scan or enter Patient Reference ID (e.g. CHX-2026-8A92F)..."
            style={{ flex: 1, minWidth: '280px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.95rem' }}
          />
          <button onClick={handleVerifyPass} className="btn btn-abdm">
            <CheckCircle2 size={16} /> Verify Pass & Check-In
          </button>
        </div>

        {verificationResult && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-emerald)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
            ✓ {verificationResult}
          </div>
        )}
      </div>

      <BedInventoryLive language={language} />
      <BloodBankRadar language={language} />
    </div>
  );
};
