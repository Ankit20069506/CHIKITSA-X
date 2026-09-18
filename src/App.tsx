import React, { useState, useEffect } from 'react';
import type { UserRole, AppLanguage, User } from './types';
import { db } from './db/database';

import { RoleSwitcherBarV2 } from './components/layout/RoleSwitcherBarV2';
import { HeaderV2 } from './components/layout/HeaderV2';
import { LandingPageV2 } from './components/landing/LandingPageV2';
import { PatientDashboardV2 } from './components/patient/PatientDashboardV2';
import { DoctorDashboardV2 } from './components/doctor/DoctorDashboardV2';
import { HospitalAdminDashboardV2 } from './components/hospital/HospitalAdminDashboardV2';
import { EmergencyRadarModal } from './components/common/EmergencyRadarModal';
import { VoiceIntakeModal } from './components/patient/VoiceIntakeModal';
import { SystemJourneyFlow } from './components/journey/SystemJourneyFlow';
import { AgentControlCenter } from './components/agents/AgentControlCenter';
import { AuthRegistrationModal } from './components/auth/AuthRegistrationModal';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('chikitsax_v2_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');
  const [activeTab, setActiveTab] = useState<string>('LANDING');
  const [patientSubTab, setPatientSubTab] = useState<string>('OVERVIEW');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVoiceIntakeOpen, setIsVoiceIntakeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthRole, setInitialAuthRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chikitsax_v2_theme', theme);
  }, [theme]);

  useEffect(() => {
    return db.subscribe('patients', () => {
      setCurrentUser(db.getCurrentUser());
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'HI' : 'EN');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role !== 'PATIENT') {
      const users = db.getDemoUsers();
      const matched = users.find(u => u.role === role);
      if (matched) db.setCurrentUser(matched);
    }

    if (role === 'PATIENT') setActiveTab('PATIENT_PORTAL');
    else if (role === 'DOCTOR') setActiveTab('DOCTOR_PORTAL');
    else if (role === 'HOSPITAL_ADMIN') setActiveTab('HOSPITAL_PORTAL');
  };

  const handleOpenAuth = (role: 'PATIENT' | 'DOCTOR' = 'PATIENT') => {
    setInitialAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (role: UserRole) => {
    setIsAuthModalOpen(false);
    setCurrentRole(role);
    if (role === 'PATIENT') setActiveTab('PATIENT_PORTAL');
    else if (role === 'DOCTOR') setActiveTab('DOCTOR_PORTAL');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      <RoleSwitcherBarV2
        currentRole={currentRole}
        language={language}
        onRoleChange={handleRoleChange}
      />

      <HeaderV2
        currentRole={currentRole}
        currentUser={currentUser}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenVoiceIntake={() => setIsVoiceIntakeOpen(true)}
        onOpenAuth={handleOpenAuth}
        onRoleSelect={handleRoleChange}
      />

      <main style={{ flex: 1, padding: '20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'LANDING' && (
          <LandingPageV2
            language={language}
            onStartJourney={() => {
              handleRoleChange('PATIENT');
              setActiveTab('PATIENT_PORTAL');
              setPatientSubTab('AI_INTAKE');
            }}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenVoiceIntake={() => setIsVoiceIntakeOpen(true)}
            onOpenAuth={handleOpenAuth}
            onSelectRole={handleRoleChange}
          />
        )}

        {activeTab === 'PATIENT_PORTAL' && (
          <PatientDashboardV2
            language={language}
            activeSubTab={patientSubTab}
            setActiveSubTab={setPatientSubTab}
            onOpenAuth={() => handleOpenAuth('PATIENT')}
          />
        )}

        {activeTab === 'DOCTOR_PORTAL' && (
          <DoctorDashboardV2
            language={language}
          />
        )}

        {activeTab === 'HOSPITAL_PORTAL' && (
          <HospitalAdminDashboardV2
            language={language}
          />
        )}

        {activeTab === 'SYSTEM_JOURNEY' && (
          <SystemJourneyFlow
            language={language}
            onNavigateToPersona={(role, tab, subTab) => {
              handleRoleChange(role);
              if (tab) setActiveTab(tab);
              if (subTab) setPatientSubTab(subTab);
            }}
          />
        )}

        {activeTab === 'AGENT_SWARM' && (
          <AgentControlCenter
            language={language}
          />
        )}
      </main>

      {isEmergencyOpen && (
        <EmergencyRadarModal
          language={language}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {isVoiceIntakeOpen && (
        <VoiceIntakeModal
          language={language}
          onClose={() => setIsVoiceIntakeOpen(false)}
          onTransferToTriage={() => {
            setIsVoiceIntakeOpen(false);
            handleRoleChange('PATIENT');
            setActiveTab('PATIENT_PORTAL');
            setPatientSubTab('AI_INTAKE');
          }}
          onBookOPD={() => {
            setIsVoiceIntakeOpen(false);
            handleRoleChange('PATIENT');
            setActiveTab('PATIENT_PORTAL');
            setPatientSubTab('HOSPITALS');
          }}
          onOpenEmergency={() => {
            setIsVoiceIntakeOpen(false);
            setIsEmergencyOpen(true);
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthRegistrationModal
          language={language}
          initialRole={initialAuthRole}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', padding: '24px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>CHIKITSA-X NEXT (v2.0)</strong> — Smart India Healthcare AI, ABDM National Stack & Care-to-Cost FinTech.
          </div>
          <div>
            Built with React 19 + TypeScript + Vite • Powered by Ayushman Bharat PM-JAY & ABDM M1/M2/M3 Architecture
          </div>
        </div>
      </footer>
    </div>
  );
};
