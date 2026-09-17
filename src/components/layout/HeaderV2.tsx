import React from 'react';
import type { UserRole, AppLanguage, User } from '../../types';
import { Stethoscope, Globe, Moon, Sun, AlertTriangle, Mic } from 'lucide-react';

interface Props {
  currentRole: UserRole;
  currentUser: User;
  language: AppLanguage;
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEmergency: () => void;
  onOpenVoiceIntake?: () => void;
  onRoleSelect: (role: UserRole) => void;
}

export const HeaderV2: React.FC<Props> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  activeTab,
  setActiveTab,
  onOpenEmergency,
  onOpenVoiceIntake,
  onRoleSelect
}) => {
  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div
          onClick={() => setActiveTab('LANDING')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                CHIKITSA<span style={{ color: 'var(--medical-blue)' }}>-X</span>
              </span>
              <span className="badge badge-teal" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>NEXT v2.0</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ABDM National Health Stack • AI Patient Intelligence
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('LANDING')}
            className={activeTab === 'LANDING' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? 'होम' : 'Home'}
          </button>
          <button
            onClick={() => {
              onRoleSelect('PATIENT');
              setActiveTab('PATIENT_PORTAL');
            }}
            className={activeTab === 'PATIENT_PORTAL' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? 'मरीज पोर्टल' : 'Patient Portal'}
          </button>
          <button
            onClick={() => {
              onRoleSelect('DOCTOR');
              setActiveTab('DOCTOR_PORTAL');
            }}
            className={activeTab === 'DOCTOR_PORTAL' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? 'डॉक्टर वर्कस्पेस' : 'Doctor Workspace'}
          </button>
          <button
            onClick={() => {
              onRoleSelect('HOSPITAL_ADMIN');
              setActiveTab('HOSPITAL_PORTAL');
            }}
            className={activeTab === 'HOSPITAL_PORTAL' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? 'अस्पताल कमांड' : 'Hospital Command'}
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM_JOURNEY')}
            className={activeTab === 'SYSTEM_JOURNEY' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? '🧭 जर्नी पाथ' : '🧭 System Journey'}
          </button>
          <button
            onClick={() => setActiveTab('AGENT_SWARM')}
            className={activeTab === 'AGENT_SWARM' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {language === 'HI' ? '🤖 एआई एजेंट्स' : '🤖 AI Agents'}
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenVoiceIntake && (
            <button
              onClick={onOpenVoiceIntake}
              className="btn btn-purple btn-sm"
              title="Speak symptoms in Hindi, Hinglish, or English"
            >
              <Mic size={14} /> {language === 'HI' ? 'आवाज से जांच' : 'Voice Intake'}
            </button>
          )}

          <button onClick={onOpenEmergency} className="btn btn-emergency btn-sm">
            <AlertTriangle size={15} /> 1-Tap SOS
          </button>

          <button
            onClick={onToggleLanguage}
            className="btn btn-secondary btn-sm"
            title="Toggle English / Hindi"
          >
            <Globe size={14} /> {language === 'HI' ? 'English' : 'हिन्दी'}
          </button>

          <button
            onClick={onToggleTheme}
            className="btn btn-secondary btn-sm"
            title="Toggle Light / Dark theme"
          >
            {theme === 'dark' ? <Sun size={14} color="var(--warning-amber)" /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
};
