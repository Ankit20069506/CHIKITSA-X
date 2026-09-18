import React, { useState } from 'react';
import type { AppLanguage } from '../../types';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Heart, FileText } from 'lucide-react';
import { db } from '../../db/database';

interface Props {
  language?: AppLanguage;
  onClose: () => void;
  onOpenScribe: () => void;
}

export const TelehealthConsultation: React.FC<Props> = ({ language = 'EN', onClose, onOpenScribe }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const currentPatient = db.getCurrentUser();
  const profile = db.getABHAProfile();
  const patientDisplayName = !currentPatient.isGuest && currentPatient.name !== 'Guest Citizen' ? currentPatient.name : 'Verified Citizen';
  const abhaDisplay = profile.abhaNumber || '14-2026-ABDM-KYC';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '0', maxWidth: '900px', overflow: 'hidden', background: '#090d16', color: '#ffffff' }}>
        <div style={{ padding: '16px 20px', background: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="live-dot" style={{ backgroundColor: '#10b981' }} />
            <div>
              <strong style={{ fontSize: '1rem' }}>Tele-OPD Room #401 (Encrypted WebRTC)</strong>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Patient: {patientDisplayName} (ABHA: {abhaDisplay})</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onOpenScribe} className="btn btn-primary btn-sm">
              <FileText size={14} /> Launch AI Ambient Scribe
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ color: '#fff', borderColor: '#374151' }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: '380px', position: 'relative' }}>
          <div style={{ background: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRight: '1px solid #334155' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
              👤
            </div>
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '0.95rem' }}>{patientDisplayName} (Patient)</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Audio/Video Stream Active</div>

            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={12} /> HR: <strong>82 bpm</strong>
              </div>
              <div style={{ color: '#38bdf8' }}>SpO2: <strong>98%</strong></div>
              <div style={{ color: '#10b981' }}>BP: <strong>138/88</strong></div>
            </div>
          </div>

          <div style={{ background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
              👨‍⚕️
            </div>
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '0.95rem' }}>Dr. Rajesh Kulkarni (You)</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Senior Interventional Cardiologist</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: '#111827', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', borderTop: '1px solid #1f2937' }}>
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, background: isMicOn ? '#374151' : '#dc2626', color: '#fff', border: 'none' }}
          >
            {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, background: isVideoOn ? '#374151' : '#dc2626', color: '#fff', border: 'none' }}
          >
            {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          <button
            onClick={onClose}
            className="btn btn-emergency btn-sm"
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title="End Teleconsultation"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
