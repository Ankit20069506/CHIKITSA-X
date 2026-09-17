import React from 'react';
import type { AppLanguage, UserRole } from '../../types';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Sparkles, ArrowRight, Percent, Clock, Mic } from 'lucide-react';

interface Props {
  language: AppLanguage;
  onStartJourney: () => void;
  onOpenEmergency: () => void;
  onOpenVoiceIntake?: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const LandingPageV2: React.FC<Props> = ({ language, onStartJourney, onOpenEmergency, onOpenVoiceIntake }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0 40px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(13, 148, 136, 0.05) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '50px 36px',
        textAlign: 'center',
        marginBottom: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'var(--medical-teal-light)', color: 'var(--medical-teal)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '20px' }}>
          <Sparkles size={14} /> SMART INDIA HEALTHCARE ECOSYSTEM 2.0
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px', color: 'var(--text-main)' }}>
          Next-Gen AI Patient Intelligence,<br />
          <span style={{ background: 'linear-gradient(90deg, var(--medical-blue), var(--medical-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ABDM National Stack & Care-to-Cost FinTech
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          From symptom intake to differential triage, from live OPD queues to 100% cashless Ayushman Bharat PM-JAY pre-auth, and 78% Jan Aushadhi generic savings.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStartJourney} className="btn btn-primary btn-lg">
            Start Patient Care Journey <ArrowRight size={18} />
          </button>
          {onOpenVoiceIntake && (
            <button onClick={onOpenVoiceIntake} className="btn btn-purple btn-lg" style={{ boxShadow: '0 8px 20px rgba(147, 51, 234, 0.3)' }}>
              <Mic size={18} /> {language === 'HI' ? 'बोलकर लक्षण बताएं (Voice)' : 'Speak Symptoms (Voice Intake)'}
            </button>
          )}
          <button onClick={onOpenEmergency} className="btn btn-emergency btn-lg">
            1-Tap Emergency SOS Radar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--medical-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medical-blue)', marginBottom: '16px' }}>
            <Activity size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Interactive Body Map & AI Differential Triage
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Pinpoint exact pain coordinates (Head, Chest, Spine, Abdomen) with VAS severity scale and obtain instant ICD-10 differential diagnoses in bilingual English/Hindi.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--abdm-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--abdm-orange)', marginBottom: '16px' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Official ABHA 2.0 Wallet & FHIR R4 Bundle
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Official NHA 14-digit ABHA Card generator with live QR verification and one-click exportable FHIR R4 electronic health records.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-emerald)', marginBottom: '16px' }}>
            <Clock size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Live OPD Digital Token Queue & Delay Alerts
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Eliminate hospital lobby crowds with live serving token HUD, estimated wait times, automated WhatsApp alerts, and digital QR fast-passes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-amber)', marginBottom: '16px' }}>
            <Percent size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Care-to-Cost 2.0: PM-JAY & 0% EMI Loans
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Multi-scheme subsidy stacking (PM-JAY ₹5L + MJPJAY + TPA + NGO Aid) eliminating financial catastrophe, with 0% interest medical financing options.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--medical-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medical-teal)', marginBottom: '16px' }}>
            <HeartPulse size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            PMBJP Jan Aushadhi 78%-88% Medicine Savings
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Automated generic substitution matching branded molecules with nearest PMBJP Kendra inventory, saving families thousands on recurring prescriptions.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '16px' }}>
            <Stethoscope size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>
            Doctor Telehealth & Ambient AI Scribe
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Encrypted video consultation with live patient vitals HUD and ambient AI transcription into structured SOAP clinical notes and signed e-Rx.
          </p>
        </div>
      </div>
    </div>
  );
};
