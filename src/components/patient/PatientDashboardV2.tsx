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
  const [selectedHospitalForOPD, setSelectedHospitalForOPD] = useState<Hospital | null>(null);
  const [activePassForModal, setActivePassForModal] = useState<LiveOPDToken | null>(null);
  const [emiGapAmount, setEmiGapAmount] = useState<number | null>(null);
  const [isCrowdfundingOpen, setIsCrowdfundingOpen] = useState(false);

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
          { id: 'AI_INTAKE', label: language === 'HI' ? 'लक्षण एवं एआई निदान' : 'Interactive Body Map & AI Triage' },
          { id: 'QUEUE', label: language === 'HI' ? 'लाइव ओपीडी टोकन' : 'Live OPD Queue & Pass' },
          { id: 'ABHA', label: language === 'HI' ? 'आभा 2.0 हेल्थ वॉलेट' : 'ABHA 2.0 & FHIR Records' },
          { id: 'FINTECH', label: language === 'HI' ? 'केयर-टू-कॉस्ट एवं ईएमआई' : 'Care-to-Cost 2.0 & Schemes' },
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
        <CareToCostEngineV2
          language={language}
          onOpenEMI={(gap) => setEmiGapAmount(gap)}
          onOpenCrowdfunding={() => setIsCrowdfundingOpen(true)}
        />
      )}

      {activeSubTab === 'HOSPITALS' && (
        <HospitalFinderV2
          language={language}
          onSelectHospital={(hosp) => setSelectedHospitalForOPD(hosp)}
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

      {isEmergencyOpen && (
        <EmergencyRadarModal
          language={language}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}
    </div>
  );
};
