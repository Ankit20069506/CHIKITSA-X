import React, { useState, useEffect } from 'react';
import type { AppLanguage } from '../../types';
import { db } from '../../db/database';
import { AlertOctagon, Phone, Navigation, CheckCircle2 } from 'lucide-react';

interface Props {
  language: AppLanguage;
  onClose: () => void;
}

export const EmergencyRadarModal: React.FC<Props> = ({ language, onClose }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [eta] = useState<number>(7);
  const nearestHospital = db.getHospitals()[0];

  useEffect(() => {
    if (countdown > 0 && !isDispatched) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isDispatched) {
      setIsDispatched(true);
    }
  }, [countdown, isDispatched]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '650px', border: '2px solid var(--emergency-red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={28} color="var(--emergency-red)" />
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--emergency-red)' }}>
                {language === 'HI' ? '1-टैप आपातकालीन एसओएस रडार' : '1-TAP EMERGENCY SOS RADAR'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Live GPS Ambulance Dispatch & Nearest Trauma Center Telemetry
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>

        {!isDispatched ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              DISPATCHING ADVANCED LIFE SUPPORT (ALS) AMBULANCE IN:
            </div>
            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--emergency-red)', lineHeight: 1 }}>
              {countdown}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '16px 0 24px' }}>
              GPS Location Broadcast: <strong>18.5204° N, 73.8567° E (Baner, Pune)</strong><br />
              Emergency contact +91 98201 54821 and nearest trauma ICU will be notified automatically.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setIsDispatched(true)} className="btn btn-emergency btn-lg">
                Dispatch Immediately Now!
              </button>
              <button onClick={onClose} className="btn btn-secondary btn-lg">
                Cancel False Alarm
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--success-emerald)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="var(--success-emerald)" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    ALS AMBULANCE DISPATCHED! (MH-12-QX-4019)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Driver: Vikram Jadhav (+91 98812 33412) • Paramedic onboard
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED ARRIVAL:</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-emerald)' }}>
                  {eta} MINS
                </div>
              </div>
            </div>

            <div style={{
              background: '#090d16',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              color: '#ffffff',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', letterSpacing: '0.05em', marginBottom: '10px' }}>
                LIVE GPS TELEMETRY & ROUTE MAPPING
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '20px 0' }}>
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--emergency-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    🚑
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ambulance Unit</div>
                </div>

                <div style={{ flex: 1, height: '3px', background: 'dashed 2px #38bdf8', margin: '0 12px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '45%', color: '#38bdf8', fontSize: '0.72rem' }}>
                    2.1 km away
                  </div>
                </div>

                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--medical-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    🏥
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{nearestHospital.name.split(' ')[0]}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.08)', padding: '8px 12px', borderRadius: '6px' }}>
                📍 Route: Via Baner Pashan Link Rd (Light Traffic) • Emergency Bed #ICU-04 Reserved.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="tel:108" className="btn btn-emergency btn-sm" style={{ flex: 1 }}>
                <Phone size={14} /> Call 108 Emergency
              </a>
              <a href="tel:9881233412" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                <Phone size={14} /> Call Ambulance Driver
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                <Navigation size={14} /> Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
