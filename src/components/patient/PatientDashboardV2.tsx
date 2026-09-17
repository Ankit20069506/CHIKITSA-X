import React, { useState } from 'react';
import type { AppLanguage, BodySymptom, Hospital, LiveOPDToken } from '../../types';
import { db } from '../../db/database';
import { BodyMapSelector } from './BodyMapSelector';
import { ChikitsaAICopilot } from './ChikitsaAICopilot';
import { ABHAWalletCard } from './ABHAWalletCard';
import { LiveOPDQueueTracker } from './LiveOPDQueueTracker';
import { CareToCostEngineV2 } from './CareToCostEngineV2';
import { MedicalEMICalculator } from './MedicalEMICalculator';
import { EmergencyCrowdfunding } from './EmergencyCrowdfunding';
import { LabReportAnalyzer } from './LabReportAnalyzer';
import { JanAushadhiFinder } from './JanAushadhiFinder';
import { MedicationSafetyChecker } from './MedicationSafetyChecker';
import { HospitalFinderV2 } from './HospitalFinderV2';
import { OPDRegistrationModalV2 } from './OPDRegistrationModalV2';
import { HospitalPassQRModal } from './HospitalPassQRModal';
import { EmergencyRadarModal } from '../common/EmergencyRadarModal';
import { VoiceIntakeView } from './VoiceIntakeView';
import { VoiceIntakeModal } from './VoiceIntakeModal';
import { CareFinanceHub } from '../finance/CareFinanceHub';
import { Mic, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  language: AppLanguage;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export const PatientDashboardV2: React.FC<Props> = ({ language, activeSubTab, setActiveSubTab }) => {
  const profile = db.getABHAProfile();
  const fhirRecords = db.getFHIRRecords();
  const biomarkers = db.getLabBiomarkers();
  const genericDrugs = db.getGenericDrugs();

  const [activeSymptom, setActiveSymptom] = useState<BodySymptom | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [targetHospitalForAmbulance, setTargetHospitalForAmbulance] = useState<Hospital | null>(null);
  const [selectedHospitalForOPD, setSelectedHospitalForOPD] = useState<Hospital | null>(null);
  const [activePassForModal, setActivePassForModal] = useState<LiveOPDToken | null>(null);
  const [emiGapAmount, setEmiGapAmount] = useState<number | null>(null);
  const [isCrowdfundingOpen, setIsCrowdfundingOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'OVERVIEW', label: language === 'HI' ? 'डैशबोर्ड ओवरव्यू' : 'Care Overview' },
          { id: 'AI_VOICE', label: language === 'HI' ? '🎙️ वॉयस इनटेक' : '🎙️ AI Voice Intake & Scribe' },
          { id: 'AI_INTAKE', label: language === 'HI' ? 'लक्षण एवं एआई निदान' : 'Interactive Body Map & AI Triage' },
          { id: 'QUEUE', label: language === 'HI' ? 'लाइव ओपीडी टोकन' : 'Live OPD Queue & Pass' },
          { id: 'ABHA', label: language === 'HI' ? 'आभा 2.0 हेल्थ वॉलेट' : 'ABHA 2.0 & FHIR Records' },
          { id: 'FINTECH', label: language === 'HI' ? '🏛️ योजनाएं, बीमा व एनजीओ' : '🏛️ Schemes, Insurance & NGO' },
          { id: 'HOSPITALS', label: language === 'HI' ? 'अस्पताल खोजक' : 'Empaneled Hospitals' },
          { id: 'LABS', label: language === 'HI' ? 'लैब बायोमार्कर' : 'Lab Biomarker Analyzer' },
          { id: 'MEDICINES', label: language === 'HI' ? 'जन औषधि जेनरिक बचत' : 'Jan Aushadhi Generic Savings' },
          { id: 'SAFETY', label: language === 'HI' ? 'दवा सुरक्षा चेकर' : 'Drug Interaction Safety' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={activeSubTab === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'OVERVIEW' && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #9333ea 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Mic size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {language === 'HI' ? 'बोलकर बताएं अपने लक्षण (Bhashini AI Voice Intake)' : 'Speak Your Symptoms in Hindi / Hinglish / English'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language === 'HI' ? 'एआई आपकी आवाज सुनकर तुरंत लक्षण, अवधि व आपातकालीन खतरे (Red Flags) पहचानेगा' : 'Voice AI transcribes speech & extracts clinical triage indicators in seconds'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="btn btn-purple btn-sm"
              >
                <Mic size={14} /> {language === 'HI' ? 'माइक शुरू करें' : 'Open Mic'}
              </button>
              <button
                onClick={() => setActiveSubTab('AI_VOICE')}
                className="btn btn-secondary btn-sm"
              >
                {language === 'HI' ? 'पूरा वॉयस व्यू' : 'Voice Dashboard'} <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <LiveOPDQueueTracker
            language={language}
            onOpenPass={(tok) => setActivePassForModal(tok)}
          />

          <BodyMapSelector
            language={language}
            onSymptomSelect={(sym) => {
              setActiveSymptom(sym);
              setActiveSubTab('AI_INTAKE');
            }}
            onEmergencyTrigger={() => setIsEmergencyOpen(true)}
          />

          <CareToCostEngineV2
            language={language}
            onOpenEMI={(gap) => setEmiGapAmount(gap)}
            onOpenCrowdfunding={() => setIsCrowdfundingOpen(true)}
          />

          <JanAushadhiFinder
            drugs={genericDrugs}
            language={language}
          />
        </>
      )}

      {activeSubTab === 'AI_INTAKE' && (
        <>
          <BodyMapSelector
            language={language}
            onSymptomSelect={(sym) => setActiveSymptom(sym)}
            onEmergencyTrigger={() => setIsEmergencyOpen(true)}
          />

          <ChikitsaAICopilot
            language={language}
            activeSymptom={activeSymptom}
            onNavigateHospitals={() => setActiveSubTab('HOSPITALS')}
            onEmergencyTrigger={() => setIsEmergencyOpen(true)}
          />
        </>
      )}

      {activeSubTab === 'AI_VOICE' && (
        <VoiceIntakeView
          language={language}
          onTransferToTriage={(sym) => {
            setActiveSymptom(sym);
            setActiveSubTab('AI_INTAKE');
          }}
          onBookOPD={() => setActiveSubTab('HOSPITALS')}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
      )}

      {activeSubTab === 'QUEUE' && (
        <LiveOPDQueueTracker
          language={language}
          onOpenPass={(tok) => setActivePassForModal(tok)}
        />
      )}

      {activeSubTab === 'ABHA' && (
        <ABHAWalletCard
          profile={profile}
          fhirRecords={fhirRecords}
          language={language}
        />
      )}

      {activeSubTab === 'FINTECH' && (
        <CareFinanceHub
          language={language}
          onOpenEMI={(gap) => setEmiGapAmount(gap)}
          onOpenCrowdfunding={() => setIsCrowdfundingOpen(true)}
        />
      )}

      {activeSubTab === 'HOSPITALS' && (
        <HospitalFinderV2
          language={language}
          onSelectHospital={(hosp) => setSelectedHospitalForOPD(hosp)}
          onCallAmbulance={(hosp) => {
            setTargetHospitalForAmbulance(hosp);
            setIsEmergencyOpen(true);
          }}
        />
      )}

      {activeSubTab === 'LABS' && (
        <LabReportAnalyzer
          biomarkers={biomarkers}
          language={language}
        />
      )}

      {activeSubTab === 'MEDICINES' && (
        <JanAushadhiFinder
          drugs={genericDrugs}
          language={language}
        />
      )}

      {activeSubTab === 'SAFETY' && (
        <MedicationSafetyChecker
          language={language}
        />
      )}

      {selectedHospitalForOPD && (
        <OPDRegistrationModalV2
          hospital={selectedHospitalForOPD}
          language={language}
          onClose={() => setSelectedHospitalForOPD(null)}
          onBookingConfirmed={(token) => {
            setSelectedHospitalForOPD(null);
            setActivePassForModal(token);
          }}
        />
      )}

      {activePassForModal && (
        <HospitalPassQRModal
          token={activePassForModal}
          language={language}
          onClose={() => setActivePassForModal(null)}
        />
      )}

      {emiGapAmount !== null && (
        <MedicalEMICalculator
          language={language}
          gapAmount={emiGapAmount}
          onClose={() => setEmiGapAmount(null)}
        />
      )}

      {isCrowdfundingOpen && (
        <EmergencyCrowdfunding
          language={language}
          onClose={() => setIsCrowdfundingOpen(false)}
        />
      )}

      {isVoiceModalOpen && (
        <VoiceIntakeModal
          language={language}
          onClose={() => setIsVoiceModalOpen(false)}
          onTransferToTriage={(sym) => {
            setActiveSymptom(sym);
            setActiveSubTab('AI_INTAKE');
          }}
          onBookOPD={() => setActiveSubTab('HOSPITALS')}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
      )}

      {isEmergencyOpen && (
        <EmergencyRadarModal
          language={language}
          targetHospital={targetHospitalForAmbulance}
          onClose={() => {
            setIsEmergencyOpen(false);
            setTargetHospitalForAmbulance(null);
          }}
        />
      )}
    </div>
  );
};
