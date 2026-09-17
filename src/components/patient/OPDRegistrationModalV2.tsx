import React, { useState } from 'react';
import type { Hospital, AppLanguage, LiveOPDToken } from '../../types';
import { db } from '../../db/database';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  hospital: Hospital;
  language: AppLanguage;
  onClose: () => void;
  onBookingConfirmed: (token: LiveOPDToken) => void;
}

export const OPDRegistrationModalV2: React.FC<Props> = ({ hospital, language, onClose, onBookingConfirmed }) => {
  const [department, setDepartment] = useState(hospital.opdDepartments[0] || 'Cardiology');
  const [doctor, setDoctor] = useState('Dr. Rajesh Kulkarni, MD');
  const [slot, setSlot] = useState('11:30 AM');

  const handleConfirm = () => {
    const token = db.bookOPDAppointment(hospital.id, department, doctor, slot);
    confetti({ particleCount: 90, spread: 60 });
    alert(`OPD Registration Confirmed! Unique Reference ID: ${token.referenceId}, Token #${token.tokenNumber}`);
    onBookingConfirmed(token);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'डिजिटल ओपीडी पंजीकरण' : 'Digital OPD Appointment Registration'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hospital.name}</div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Select Department
          </label>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
          >
            {hospital.opdDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Attending Specialist
          </label>
          <select
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
          >
            <option value="Dr. Rajesh Kulkarni, MD">Dr. Rajesh Kulkarni, MD, DM (Cardiology)</option>
            <option value="Dr. Sunita Patel, MS">Dr. Sunita Patel, MS (Internal Medicine)</option>
            <option value="Dr. A. Deshmukh, DNB">Dr. A. Deshmukh, DNB (Interventionalist)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Select Time Slot
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map(s => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={slot === s ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ✓ Verified ABHA: <strong>14-2026-9812-4401</strong><br />
          ✓ Zero Registration Fee under Ayushman Bharat PM-JAY.
        </div>

        <button onClick={handleConfirm} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          <CheckCircle2 size={18} /> Confirm OPD Booking & Generate QR Pass
        </button>
      </div>
    </div>
  );
};
