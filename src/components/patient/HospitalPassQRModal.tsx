import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { LiveOPDToken, AppLanguage } from '../../types';
import { QrCode, Printer } from 'lucide-react';

interface Props {
  token: LiveOPDToken;
  language: AppLanguage;
  onClose: () => void;
}

export const HospitalPassQRModal: React.FC<Props> = ({ token, language, onClose }) => {
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(
        qrRef.current,
        `CHIKITSAX-PASS|${token.referenceId}|TOKEN:${token.tokenNumber}|HOSP:${token.hospitalId}|PAT:${token.patientId}`,
        { width: 180, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }
      );
    }
  }, [token]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--medical-teal)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Digital OPD QR Fast-Pass</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'inline-block',
          marginBottom: '16px'
        }}>
          <canvas ref={qrRef} style={{ width: '180px', height: '180px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginTop: '8px', letterSpacing: '0.08em' }}>
            {token.referenceId}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Token #{token.tokenNumber} • {token.department}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px', textAlign: 'left', fontSize: '0.84rem' }}>
          <div style={{ marginBottom: '4px' }}><strong>Hospital:</strong> {token.hospitalName}</div>
          <div style={{ marginBottom: '4px' }}><strong>Specialist:</strong> {token.doctorName}</div>
          <div style={{ marginBottom: '4px' }}><strong>Time Slot:</strong> {token.appointmentSlot} (Today)</div>
          <div><strong>Patient:</strong> {token.patientName} (ABHA Verified)</div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
            <Printer size={15} /> Print Pass
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
