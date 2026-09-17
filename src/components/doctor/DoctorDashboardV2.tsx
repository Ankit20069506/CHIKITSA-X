import React, { useState } from 'react';
import type { AppLanguage, SOAPClinicalNote } from '../../types';
import { db } from '../../db/database';
import { Stethoscope, Video, FileText, CheckCircle2, User } from 'lucide-react';
import { AmbientAIScribe } from './AmbientAIScribe';
import { TelehealthConsultation } from './TelehealthConsultation';

interface Props {
  language: AppLanguage;
}

export const DoctorDashboardV2: React.FC<Props> = ({ language }) => {
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isScribeOpen, setIsScribeOpen] = useState(false);
  const [soapNotes, setSoapNotes] = useState<SOAPClinicalNote[]>(() => db.getSOAPNotes());
  const [activeDoctor, setActiveDoctor] = useState(() => db.getActiveDoctor());
  const activePatient = db.getABHAProfile();

  React.useEffect(() => {
    const unsub = db.subscribe('doctors', () => {
      setActiveDoctor(db.getActiveDoctor());
    });
    return unsub;
  }, []);

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
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                {activeDoctor.name}{activeDoctor.qualifications ? `, ${activeDoctor.qualifications}` : ''}
              </h1>
              <span className="badge badge-teal">NMC REGISTERED</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {activeDoctor.hospitalAffiliation} • {activeDoctor.specialty} OPD • Reg ID: <strong style={{ color: 'var(--medical-blue)' }}>{activeDoctor.nmcRegistrationId}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setIsTelehealthOpen(true)} className="btn btn-primary">
            <Video size={16} /> Start Tele-OPD Video Call
          </button>
          <button onClick={() => setIsScribeOpen(true)} className="btn btn-secondary">
            <FileText size={16} /> Ambient AI Scribe
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--medical-blue)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              Active Patient: {activePatient.fullName} (ABHA: {activePatient.abhaNumber})
            </h3>
          </div>
          <span className="badge badge-green">ABDM Consent Granted</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Age / Gender:</span>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>31 Y / MALE</div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Blood Group:</span>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--medical-blue)' }}>{activePatient.bloodGroup}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chief Complaint:</span>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--emergency-red)' }}>Exertional Retrosternal Tightness</div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scheme Entitlement:</span>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--success-emerald)' }}>PM-JAY + MJPJAY Verified</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsScribeOpen(true)} className="btn btn-primary btn-sm">
            Draft Clinical SOAP Consultation Note
          </button>
        </div>
      </div>

      {isScribeOpen && (
        <AmbientAIScribe
          language={language}
          onClose={() => setIsScribeOpen(false)}
          onNoteSaved={(note) => {
            setSoapNotes([note, ...soapNotes]);
            setIsScribeOpen(false);
          }}
        />
      )}

      {isTelehealthOpen && (
        <TelehealthConsultation
          language={language}
          onClose={() => setIsTelehealthOpen(false)}
          onOpenScribe={() => {
            setIsTelehealthOpen(false);
            setIsScribeOpen(true);
          }}
        />
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="var(--success-emerald)" />
          Signed Clinical Consultations & e-Prescriptions History
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {soapNotes.map(note => (
            <div
              key={note.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{note.assessment}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{note.date} • {note.doctorName}</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  {note.digitalSignature.substring(0, 18)}...
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px', background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Plan & Rx:</strong> {note.plan}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {note.prescriptions.map((rx, idx) => (
                  <span key={idx} className="badge badge-teal" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                    💊 {rx.medicine} ({rx.frequency})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
