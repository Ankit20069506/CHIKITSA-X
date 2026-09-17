import React, { useState, useEffect } from 'react';
import type { AppLanguage, Hospital } from '../../types';
import { Building2, QrCode, CheckCircle2, Plus, Cpu, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { BedInventoryLive } from './BedInventoryLive';
import { BloodBankRadar } from './BloodBankRadar';
import { RegisterHospitalModal } from './RegisterHospitalModal';
import { AgentControlCenter } from '../agents/AgentControlCenter';
import { db } from '../../db/database';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
}

export const HospitalAdminDashboardV2: React.FC<Props> = ({ language }) => {
  const [tokenInput, setTokenInput] = useState('CHX-2026-8A92F');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'AGENTS' | 'DIRECTORY'>('TELEMETRY');
  const [hospitals, setHospitals] = useState<Hospital[]>(() => db.getHospitals());

  useEffect(() => {
    const unsub = db.subscribe('hospitals', () => {
      setHospitals(db.getHospitals());
    });
    return () => unsub();
  }, []);

  const handleVerifyPass = () => {
    confetti({ particleCount: 70, spread: 60 });
    setVerificationResult('SUCCESS: Reference ID CHX-2026-8A92F verified. Patient Ankit Patel checked-in for Cardiology OPD #04.');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Banner */}
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
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Priya Sharma (Hospital Admin Command)</h1>
              <span className="badge badge-orange">COMMAND CENTER</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              CarePlus Tertiary Heart Hospital • Reception, Bed Telemetry & PM-JAY Helpdesk
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}
        >
          <Plus size={16} /> Register New Hospital Facility
        </button>
      </div>

      {/* Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={activeTab === 'TELEMETRY' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Activity size={15} /> Bed Telemetry & OPD Check-In
        </button>
        <button
          onClick={() => setActiveTab('AGENTS')}
          className={activeTab === 'AGENTS' ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Cpu size={15} /> Autonomous Background Swarm
        </button>
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={activeTab === 'DIRECTORY' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Building2 size={15} /> Registered Hospital Facilities ({hospitals.length})
        </button>
      </div>

      {activeTab === 'TELEMETRY' && (
        <>
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
        </>
      )}

      {activeTab === 'AGENTS' && (
        <AgentControlCenter language={language} />
      )}

      {activeTab === 'DIRECTORY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {hospitals.map(hosp => (
            <div key={hosp.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>{hosp.id}</span>
                    <h3 style={{ margin: '4px 0 2px', fontSize: '1.1rem', fontWeight: 800 }}>{hosp.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {hosp.city}, {hosp.state} • {hosp.type.replace('_', ' ')}
                    </div>
                  </div>
                  <span className="badge badge-teal">Score: {hosp.chikitsaCareScore}/100</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', margin: '14px 0', fontSize: '0.8rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ICU Beds</div>
                    <div style={{ fontWeight: 800 }}>{hosp.bedTelemetry.icuAvailable} / {hosp.bedTelemetry.icuTotal} Free</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>General Beds</div>
                    <div style={{ fontWeight: 800 }}>{hosp.bedTelemetry.generalBedsAvailable} / {hosp.bedTelemetry.generalBedsTotal} Free</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Empaneled Schemes:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {hosp.acceptedGovSchemes.map((s, idx) => (
                      <span key={idx} className="badge badge-green" style={{ fontSize: '0.68rem' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Emergency: <strong>{hosp.contactNumber}</strong> • Ping: {hosp.bedTelemetry.lastTelemetryPing}
              </div>
            </div>
          ))}
        </div>
      )}

      {isRegisterModalOpen && (
        <RegisterHospitalModal
          language={language}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegistered={() => {
            setHospitals(db.getHospitals());
          }}
        />
      )}
    </div>
  );
};
