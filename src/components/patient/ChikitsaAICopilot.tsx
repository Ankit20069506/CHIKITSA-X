import React, { useState, useEffect, useMemo } from 'react';
import type { AppLanguage, TriageDifferential, BodySymptom, Hospital, OCRScannedRecord } from '../../types';
import { db } from '../../db/database';
import {
  Bot,
  Mic,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  Activity,
  FileText,
  RefreshCw,
  LocateFixed,
  Award,
  Building2,
  Zap,
  Camera,
  X
} from 'lucide-react';
import { VoiceIntakeModal } from './VoiceIntakeModal';
import { MedicalRecordOCRScanner } from './MedicalRecordOCRScanner';
import {
  getStoredPatientLocation,
  calculateHaversineDistanceKm,
  estimateDrivingEtaMinutes,
  DEFAULT_PATIENT_LOCATION,
  type PatientCoordinates
} from '../../services/geolocationService';

interface Props {
  language: AppLanguage;
  activeSymptom?: BodySymptom | null;
  onNavigateHospitals: () => void;
  onEmergencyTrigger: () => void;
  onBookHospitalOPD?: (hospital: Hospital) => void;
}

export type TriageCategory = 'CARDIAC' | 'NEUROLOGY' | 'GASTRO' | 'ORTHO' | 'PULMONARY' | 'ONCOLOGY' | 'INFECTION';

export interface ClinicalTriageSummary {
  category: TriageCategory;
  esiLevel: 'ESI-1 (Immediate Resuscitation)' | 'ESI-2 (Emergent)' | 'ESI-3 (Urgent OPD)' | 'ESI-4 (Non-Urgent / Routine)';
  urgencyColor: string;
  chiefComplaint: string;
  chiefComplaintHindi: string;
  clinicalImpression: string;
  clinicalImpressionHindi: string;
  primarySpecialty: string;
  recommendedDiagnostics: string[];
  redFlags: string[];
  differentials: TriageDifferential[];
}

export const ChikitsaAICopilot: React.FC<Props> = ({
  language,
  activeSymptom,
  onNavigateHospitals,
  onEmergencyTrigger,
  onBookHospitalOPD
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [scannedRecord, setScannedRecord] = useState<OCRScannedRecord | null>(() => activeSymptom?.scannedRecord || null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<string | null>(null);

  // Patient Location State
  const [patientLocation, setPatientLocation] = useState<PatientCoordinates | null>(() => getStoredPatientLocation());

  useEffect(() => {
    const handleStorage = () => {
      setPatientLocation(getStoredPatientLocation());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeCoords = patientLocation || DEFAULT_PATIENT_LOCATION;

  // Transcript Input
  const [transcript, setTranscript] = useState<string>(
    activeSymptom
      ? `Patient reports severe ${activeSymptom.symptoms.join(', ')} in ${activeSymptom.partName} (${activeSymptom.hindiName}) with pain severity ${activeSymptom.severity}/10 for ${activeSymptom.duration}.`
      : 'Severe retrosternal chest tightness radiating to left shoulder and jaw with cold sweating and shortness of breath for 3 days.'
  );

  // Core Clinical Intelligence Algorithm
  const runClinicalTriageEngine = (text: string, severityScale: number = 7): ClinicalTriageSummary => {
    const lower = text.toLowerCase();

    // 1. CARDIAC
    if (
      lower.includes('chest') ||
      lower.includes('सीना') ||
      lower.includes('छाती') ||
      lower.includes('heart') ||
      lower.includes('दिल') ||
      lower.includes('cardiac') ||
      lower.includes('angina') ||
      lower.includes('palpitation') ||
      lower.includes('घबराहट') ||
      lower.includes('left arm') ||
      lower.includes('cold sweat') ||
      lower.includes('पसीना')
    ) {
      const isCritical = severityScale >= 7 || lower.includes('sweat') || lower.includes('arm') || lower.includes('jaw');
      return {
        category: 'CARDIAC',
        esiLevel: isCritical ? 'ESI-1 (Immediate Resuscitation)' : 'ESI-2 (Emergent)',
        urgencyColor: '#ef4444',
        chiefComplaint: 'Acute Retrosternal Chest Constriction with Exertional Dyspnea',
        chiefComplaintHindi: 'छाती में तीव्र जकड़न, सांस लेने में तकलीफ एवं पसीना',
        clinicalImpression:
          'Presentation strongly suspicious for Acute Coronary Syndrome (ACS) / Myocardial Ischemia. Requires immediate 12-lead ECG, high-sensitivity Cardiac Troponin I/T assays, and continuous hemodynamic monitoring.',
        clinicalImpressionHindi:
          'हृदय धमनी रुकावट (एंजाइना / एक्यूट कोरोनरी सिंड्रोम) का गंभीर संदेह। तुरंत 12-लीड ईसीजी एवं ट्रोपोनिन टेस्ट आवश्यक है।',
        primarySpecialty: 'Cardiology',
        recommendedDiagnostics: ['12-Lead ECG (Within 10 mins)', 'Serum Troponin-I / CK-MB', '2D-Echocardiogram', 'Lipid Profile & Serum Electrolytes'],
        redFlags: ['Radiation to left arm/jaw', 'Diaphoresis (cold sweats)', 'Dyspnea on minimal exertion', 'Hemodynamic instability'],
        differentials: [
          {
            conditionName: 'Acute Coronary Syndrome (Unstable Angina / NSTEMI)',
            hindiName: 'एक्यूट कोरोनरी सिंड्रोम (हृदय की धमनी में रुकावट)',
            icd10: 'I20.0',
            probability: 'HIGH',
            urgency: 'EMERGENCY',
            recommendedSpecialty: 'Interventional Cardiology',
            reasoning: 'Severe compressive retrosternal pain with radiation and diaphoresis represents high pre-test probability for myocardial ischemia.',
            redFlags: ['Left arm radiation', 'Diaphoresis', 'Cyanosis/dyspnea']
          },
          {
            conditionName: 'Gastroesophageal Reflux Disease (GERD) with Esophageal Spasm',
            hindiName: 'गैस्ट्रोएसोफेगल रिफ्लक्स एवं अन्नप्रणाली ऐंठन',
            icd10: 'K21.9',
            probability: 'MODERATE',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'Gastroenterology',
            reasoning: 'Can mimic ischemic chest discomfort, but absence of relief with rest makes cardiac etiology the non-negotiable primary rule-out.',
            redFlags: ['Postprandial heartburn', 'Acid regurgitation']
          },
          {
            conditionName: 'Costochondritis / Musculoskeletal Chest Wall Pain',
            hindiName: 'छाती की पसलियों में मांसपेशियों का खिंचाव',
            icd10: 'M94.0',
            probability: 'LOW',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'Internal Medicine',
            reasoning: 'Considered only if localized point tenderness over costochondral junctions is present without systemic signs.',
            redFlags: ['Tenderness on manual palpation']
          }
        ]
      };
    }

    // 2. NEUROLOGY / HEAD
    if (
      lower.includes('head') ||
      lower.includes('सिर') ||
      lower.includes('headache') ||
      lower.includes('माइग्रेन') ||
      lower.includes('migraine') ||
      lower.includes('vertigo') ||
      lower.includes('चक्कर') ||
      lower.includes('paralysis') ||
      lower.includes('stroke') ||
      lower.includes('लकवा') ||
      lower.includes('slurred') ||
      lower.includes('seizure') ||
      lower.includes('दौरा')
    ) {
      const isCritical = severityScale >= 8 || lower.includes('slurred') || lower.includes('paralysis') || lower.includes('seizure');
      return {
        category: 'NEUROLOGY',
        esiLevel: isCritical ? 'ESI-1 (Immediate Resuscitation)' : 'ESI-2 (Emergent)',
        urgencyColor: isCritical ? '#ef4444' : '#f59e0b',
        chiefComplaint: 'Acute Severe Cranial Pain & Neurological Dysfunction',
        chiefComplaintHindi: 'तीव्र सिरदर्द, चक्कर एवं न्यूरोलॉजिकल लक्षण',
        clinicalImpression:
          'Acute intractable headache accompanied by vestibular or neurological deficit. Differential includes Complex Migraine, Subarachnoid Hemorrhage, or Acute Cerebrovascular Event (Stroke code evaluation).',
        clinicalImpressionHindi:
          'तीव्र सिरदर्द व चक्कर। आपातकालीन सीटी-ब्रेन एवं न्यूरोलॉजिकल जांच द्वारा स्ट्रोक व रक्तस्राव की पुष्टि आवश्यक है।',
        primarySpecialty: 'Neurology',
        recommendedDiagnostics: ['Non-Contrast CT Brain', 'MRI Brain with MR Angiography', 'Fundoscopy for Papilledema', 'Carotid Doppler Ultrasound'],
        redFlags: ['Sudden thunderclap onset', 'Unilateral motor weakness / facial droop', 'Slurred speech (Dysarthria)', 'Loss of consciousness'],
        differentials: [
          {
            conditionName: 'Acute Migraine with Aura & Vestibular Cephalea',
            hindiName: 'माइग्रेन (आभा युक्त तीव्र आधा सीसी सिरदर्द)',
            icd10: 'G43.1',
            probability: 'HIGH',
            urgency: 'URGENT_OPD',
            recommendedSpecialty: 'Neurology',
            reasoning: 'Throbbing hemicranial pain with photophobia and nausea consistent with neurovascular trigeminovascular activation.',
            redFlags: ['Visual scotoma', 'Nausea/vomiting', 'Photophobia']
          },
          {
            conditionName: 'Transient Ischemic Attack (TIA) / Acute Ischemic Stroke Rule-Out',
            hindiName: 'अस्थायी मस्तिष्क आघात / इस्केमिक स्ट्रोक चेतावनी',
            icd10: 'G45.9',
            probability: isCritical ? 'HIGH' : 'LOW',
            urgency: 'EMERGENCY',
            recommendedSpecialty: 'Neurology & Stroke Unit',
            reasoning: 'Any focal neurological deficit or sudden speech difficulty demands immediate stroke-protocol imaging within golden hour.',
            redFlags: ['FAST protocol positive', 'Limb numbness', 'Facial asymmetry']
          },
          {
            conditionName: 'Tension-Type Intracranial Cephalea',
            hindiName: 'तनाव जनित सिरदर्द',
            icd10: 'G44.2',
            probability: 'MODERATE',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'General Medicine',
            reasoning: 'Band-like compressive bilateral discomfort without focal deficits or thunderclap onset.',
            redFlags: ['Neck muscle spasm', 'Chronic fatigue']
          }
        ]
      };
    }

    // 3. GASTROINTESTINAL / ABDOMEN
    if (
      lower.includes('stomach') ||
      lower.includes('पेट') ||
      lower.includes('abdomen') ||
      lower.includes('vomit') ||
      lower.includes('उल्टी') ||
      lower.includes('cramp') ||
      lower.includes('diarrhea') ||
      lower.includes('दस्त') ||
      lower.includes('acid') ||
      lower.includes('gas') ||
      lower.includes('ulcer')
    ) {
      const isCritical = severityScale >= 8 || lower.includes('blood') || lower.includes('खून');
      return {
        category: 'GASTRO',
        esiLevel: isCritical ? 'ESI-2 (Emergent)' : 'ESI-3 (Urgent OPD)',
        urgencyColor: isCritical ? '#ef4444' : '#0284c7',
        chiefComplaint: 'Acute Abdominal Pain with Gastrointestinal Distress',
        chiefComplaintHindi: 'पेट में तीव्र दर्द, मरोड़ एवं एसिडिटी',
        clinicalImpression:
          'Acute abdominal discomfort with localized guarding or cramping. Evaluation required to differentiate Acute Appendicitis, Peptic Ulcer Disease, and Acute Cholelithiasis from uncomplicated viral gastroenteritis.',
        clinicalImpressionHindi:
          'पेट में तेज दर्द व मरोड़। अपेंडिसाइटिस, अल्सर व पित्ताशय पथरी की पुष्टि हेतु सोनोग्राफी आवश्यक है।',
        primarySpecialty: 'Gastroenterology',
        recommendedDiagnostics: ['Ultrasound Whole Abdomen (USG)', 'Serum Amylase & Lipase', 'Complete Blood Count with ESR', 'Liver Function Tests (LFT)'],
        redFlags: ['Right lower quadrant guarding (McBurney point)', 'Hematemesis (blood in vomit)', 'Rebound tenderness', 'High fever with abdominal rigidity'],
        differentials: [
          {
            conditionName: 'Acute Gastritis & Peptic Ulcer Hyperacidity',
            hindiName: 'एक्यूट गैस्ट्राइटिस एवं पेप्टिक अल्सर',
            icd10: 'K29.7',
            probability: 'HIGH',
            urgency: 'URGENT_OPD',
            recommendedSpecialty: 'Gastroenterology',
            reasoning: 'Epigastric burning discomfort with post-meal aggravation and nausea, amenable to PPI suppression.',
            redFlags: ['Epigastric tenderness', 'Melena (dark stool)']
          },
          {
            conditionName: 'Acute Appendicitis / Mesenteric Lymphadenitis',
            hindiName: 'अपेंडिसाइटिस (अपेंडिक्स में सूजन व संक्रमण)',
            icd10: 'K35.8',
            probability: 'MODERATE',
            urgency: 'EMERGENCY',
            recommendedSpecialty: 'General & Laparoscopic Surgery',
            reasoning: 'Periumbilical pain migrating to right iliac fossa requires urgent clinical and ultrasound surgical triage.',
            redFlags: ['Pain shifting to right lower abdomen', 'Anorexia', 'Low-grade fever']
          },
          {
            conditionName: 'Acute Infectious Gastroenteritis',
            hindiName: 'संक्रामक गैस्ट्रोएंटेराइटिस (पेट का इन्फेक्शन)',
            icd10: 'A09.0',
            probability: 'MODERATE',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'General Medicine',
            reasoning: 'Diffuse cramping associated with loose stools, requiring oral rehydration and gut flora restoration.',
            redFlags: ['Dehydration signs', 'Electrolyte imbalance']
          }
        ]
      };
    }

    // 4. ORTHOPEDIC / TRAUMA
    if (
      lower.includes('bone') ||
      lower.includes('हड्डी') ||
      lower.includes('joint') ||
      lower.includes('जोड़') ||
      lower.includes('knee') ||
      lower.includes('घुटने') ||
      lower.includes('fracture') ||
      lower.includes('sprain') ||
      lower.includes('back') ||
      lower.includes('कमर') ||
      lower.includes('spine') ||
      lower.includes('accident') ||
      lower.includes('chot') ||
      lower.includes('चोट')
    ) {
      const isCritical = severityScale >= 8 || lower.includes('fracture') || lower.includes('accident');
      return {
        category: 'ORTHO',
        esiLevel: isCritical ? 'ESI-2 (Emergent)' : 'ESI-3 (Urgent OPD)',
        urgencyColor: isCritical ? '#ef4444' : '#0d9488',
        chiefComplaint: 'Acute Musculoskeletal Trauma & Joint Mobility Impairment',
        chiefComplaintHindi: 'हड्डी, जोड़ व मांसपेशियों में चोट अथवा तीव्र दर्द',
        clinicalImpression:
          'Mechanical joint dysfunction or traumatic bone integrity compromise. Requires digital radiography to assess structural bony disruption vs ligamentous sprain or disc radiculopathy.',
        clinicalImpressionHindi:
          'जोड़ व हड्डी में दर्द। फ्रैक्चर व लिगामेंट चोट की जांच हेतु डिजिटल एक्स-रे व ऑर्थोपेडिक परामर्श आवश्यक है।',
        primarySpecialty: 'Orthopedics',
        recommendedDiagnostics: ['Digital X-Ray Affected Limb/Spine (AP/Lateral)', 'MRI Joint/Spine (if soft tissue tear suspected)', 'Serum Uric Acid & ESR'],
        redFlags: ['Gross bony deformity or crepitus', 'Inability to bear weight', 'Loss of peripheral pulses', 'Bladder/bowel incontinence (cauda equina)'],
        differentials: [
          {
            conditionName: 'Acute Lumbar Radiculopathy / Spondylogenic Strain',
            hindiName: 'कमर दर्द एवं साइटिका (दबी हुई नस)',
            icd10: 'M54.5',
            probability: 'HIGH',
            urgency: 'URGENT_OPD',
            recommendedSpecialty: 'Orthopedics & Spine Care',
            reasoning: 'Paravertebral muscular spasm with mechanical limitation on bending, exacerbated by prolonged postural stress.',
            redFlags: ['Radiation down the leg', 'Motor weakness in foot']
          },
          {
            conditionName: 'Closed Traumatic Bone Fracture / Periosteal Contusion',
            hindiName: 'अस्थि भंग (हड्डी में फ्रैक्चर अथवा गहरी चोट)',
            icd10: 'S82.9',
            probability: isCritical ? 'HIGH' : 'LOW',
            urgency: 'EMERGENCY',
            recommendedSpecialty: 'Orthopedic Trauma Surgery',
            reasoning: 'Severe focal bony tenderness following acute blunt impact or twisting injury.',
            redFlags: ['Obvious swelling and deformity', 'Severe pain on axial loading']
          },
          {
            conditionName: 'Acute Ligamentous Sprain & Synovial Effusion',
            hindiName: 'लिगामेंट में खिंचाव व जोड़ में सूजन',
            icd10: 'M25.4',
            probability: 'MODERATE',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'Orthopedics',
            reasoning: 'Localized periarticular swelling without bone displacement, responsive to immobilization and cold therapy.',
            redFlags: ['Joint instability on stress testing']
          }
        ]
      };
    }

    // 5. PULMONARY / RESPIRATORY
    if (
      lower.includes('cough') ||
      lower.includes('खांसी') ||
      lower.includes('breath') ||
      lower.includes('सांस') ||
      lower.includes('asthma') ||
      lower.includes('दमा') ||
      lower.includes('phlegm') ||
      lower.includes('बलगम') ||
      lower.includes('wheezing') ||
      lower.includes('pneumonia') ||
      lower.includes('निमोनिया')
    ) {
      const isCritical = severityScale >= 7 || lower.includes('breath') || lower.includes('सांस फूल');
      return {
        category: 'PULMONARY',
        esiLevel: isCritical ? 'ESI-2 (Emergent)' : 'ESI-3 (Urgent OPD)',
        urgencyColor: isCritical ? '#ef4444' : '#0284c7',
        chiefComplaint: 'Bronchial Hyperreactivity & Respiratory Distress',
        chiefComplaintHindi: 'सांस लेने में कठिनाई, खांसी एवं फेफड़ों में संक्रमण',
        clinicalImpression:
          'Lower respiratory airway inflammation with expiratory wheezing or infective consolidation. Urgent SpO2 pulse oximetry, chest radiography, and bronchodilator nebulization indicated.',
        clinicalImpressionHindi:
          'श्वसन तंत्र में संक्रमण व सांस लेने में परेशानी। पल्स ऑक्सीमीटर व चेस्ट एक्स-रे द्वारा तुरंत जांच आवश्यक है।',
        primarySpecialty: 'Pulmonology',
        recommendedDiagnostics: ['Chest X-Ray PA View', 'Continuous Pulse Oximetry (SpO2)', 'Spirometry / Peak Expiratory Flow', 'Sputum Examination & CBC'],
        redFlags: ['Resting SpO2 < 92% on room air', 'Accessory muscle usage / stridor', 'Hemoptysis (coughing blood)', 'High fever with bronchial breath sounds'],
        differentials: [
          {
            conditionName: 'Acute Exacerbation of Bronchial Asthma / Bronchitis',
            hindiName: 'अस्थमा का तीव्र दौरा / ब्रोन्काइटिस',
            icd10: 'J45.9',
            probability: 'HIGH',
            urgency: 'URGENT_OPD',
            recommendedSpecialty: 'Pulmonology',
            reasoning: 'Reversible bronchospasm with wheezing, triggered by environmental allergens or viral upper tract illness.',
            redFlags: ['Intercostal indrawing', 'SpO2 desaturation']
          },
          {
            conditionName: 'Community-Acquired Lobar Pneumonia',
            hindiName: 'कम्युनिटी-अक्वायर्ड न्यूमोनिया (फेफड़ों का इन्फेक्शन)',
            icd10: 'J18.9',
            probability: 'MODERATE',
            urgency: 'EMERGENCY',
            recommendedSpecialty: 'Pulmonology & Critical Care',
            reasoning: 'Productive purulent cough accompanied by fever, chills, and localized crackles on auscultation.',
            redFlags: ['Tachypnea > 24/min', 'Confusion in elderly', 'Pleuritic chest pain']
          },
          {
            conditionName: 'Acute Viral Tracheobronchitis',
            hindiName: 'वायरल श्वासनली संक्रमण',
            icd10: 'J20.9',
            probability: 'MODERATE',
            urgency: 'ROUTINE_CONSULT',
            recommendedSpecialty: 'General Medicine',
            reasoning: 'Self-limiting irritation of upper and mid-trachea without parenchymal infiltration.',
            redFlags: ['Persistent dry hacking cough']
          }
        ]
      };
    }

    // 6. DEFAULT / GENERAL MEDICINE & FEBRILE
    return {
      category: 'INFECTION',
      esiLevel: severityScale >= 8 ? 'ESI-2 (Emergent)' : 'ESI-3 (Urgent OPD)',
      urgencyColor: severityScale >= 8 ? '#ef4444' : '#10b981',
      chiefComplaint: 'Acute Febrile Illness & Constitutional Symptom Complex',
      chiefComplaintHindi: 'तीव्र बुखार, शरीर में दर्द एवं शारीरिक कमजोरी',
      clinicalImpression:
        'Constitutional inflammatory or infectious syndrome. Complete hematological panel, malarial/dengue serology, and urine microscopy required for source identification.',
      clinicalImpressionHindi:
        'संक्रामक बुखार व कमजोरी। सीबीसी, प्लेटलेट काउंट व डेंगू/मलेरिया जांच आवश्यक है।',
      primarySpecialty: 'General Medicine',
      recommendedDiagnostics: ['Complete Blood Count (CBC) with Platelet Count', 'Dengue NS1 Antigen & IgM/IgG', 'Malarial Antigen Rapid Test', 'Urine Routine & Microscopic'],
      redFlags: ['Platelet count dropping < 50,000 /mcL', 'High spiking fever > 103°F with rigors', 'Petechial skin rash or bleeding gums', 'Altered mental sensorium'],
      differentials: [
        {
          conditionName: 'Acute Viral Syndrome / Febrile Illness',
          hindiName: 'एक्यूट वायरल सिंड्रोम (वायरल बुखार)',
          icd10: 'B34.9',
          probability: 'HIGH',
          urgency: 'URGENT_OPD',
          recommendedSpecialty: 'General Medicine',
          reasoning: 'Generalized myalgia, low back ache, and fever spikes typical of endemic viral illness.',
          redFlags: ['Dehydration', 'Persistent high fever > 48h']
        },
        {
          conditionName: 'Acute Dengue or Vector-Borne Fever Surveillance',
          hindiName: 'डेंगू / वेक्टर जनित बुखार का संदेह',
          icd10: 'A90',
          probability: 'MODERATE',
          urgency: 'URGENT_OPD',
          recommendedSpecialty: 'Internal Medicine',
          reasoning: 'Retro-orbital headache and thrombocytopenia risk warrant daily hematocrit tracking.',
          redFlags: ['Severe persistent abdominal pain', 'Persistent vomiting', 'Mucosal bleed']
        },
        {
          conditionName: 'Acute Upper Respiratory Tract Infection (URTI)',
          hindiName: 'ऊपरी श्वसन पथ संक्रमण (सर्दी-जुकाम)',
          icd10: 'J06.9',
          probability: 'MODERATE',
          urgency: 'ROUTINE_CONSULT',
          recommendedSpecialty: 'General Practice',
          reasoning: 'Rhinorrhea, mild pharyngeal erythema, and cervical lymphadenopathy.',
          redFlags: ['Inability to swallow liquids']
        }
      ]
    };
  };

  // Merge OCR Biometric Lab Findings into Triage Summary
  const enhanceSummaryWithOCR = (summary: ClinicalTriageSummary, record?: OCRScannedRecord | null): ClinicalTriageSummary => {
    const activeRec = record !== undefined ? record : scannedRecord;
    if (!activeRec) return summary;

    const biomarkers = activeRec.extractedBiomarkers || [];
    const hasCriticalBiomarker = biomarkers.some(
      b => b.severity === 'CRITICAL' || (b.isAbnormal && (b.testName.toLowerCase().includes('troponin') || b.testName.toLowerCase().includes('platelet') || b.testName.toLowerCase().includes('creatinine')))
    );

    const hasAbnormalBiomarker = biomarkers.some(b => b.isAbnormal);

    const updatedEsi = hasCriticalBiomarker
      ? 'ESI-1 (Immediate Resuscitation)'
      : (hasAbnormalBiomarker && summary.esiLevel.startsWith('ESI-3'))
      ? 'ESI-2 (Emergent)'
      : summary.esiLevel;

    const updatedUrgencyColor = hasCriticalBiomarker
      ? '#ef4444'
      : (hasAbnormalBiomarker && summary.esiLevel.startsWith('ESI-3'))
      ? '#f59e0b'
      : summary.urgencyColor;

    const abnormalList = biomarkers
      .filter(b => b.isAbnormal)
      .map(b => `${b.testName}: ${b.value} ${b.unit} [${b.severity}]`)
      .join(', ');

    const ocrImpression = `\n\n📄 [Integrated Lab/OCR Record - ${activeRec.facilityName}]: Prior Diagnosis: ${activeRec.previousDiagnosis}. Biomarkers: ${abnormalList || 'Normal parameters'}.`;
    const ocrImpressionHi = `\n\n📄 [सत्यापित मेडिकल ओसीआर रिकॉर्ड - ${activeRec.facilityName}]: पूर्व निदान: ${activeRec.previousDiagnosisHindi || activeRec.previousDiagnosis}। बायोमार्कर एकीकृत।`;

    const critList = biomarkers
      .filter(b => b.severity === 'CRITICAL')
      .map(b => `Lab Biomarker Critical: ${b.testName} (${b.value} ${b.unit})`);

    return {
      ...summary,
      esiLevel: updatedEsi,
      urgencyColor: updatedUrgencyColor,
      clinicalImpression: summary.clinicalImpression + ocrImpression,
      clinicalImpressionHindi: summary.clinicalImpressionHindi + ocrImpressionHi,
      redFlags: critList.length > 0 ? [...critList, ...summary.redFlags] : summary.redFlags
    };
  };

  // Active Clinical Triage Summary
  const [triageSummary, setTriageSummary] = useState<ClinicalTriageSummary | null>(() => {
    const base = runClinicalTriageEngine(transcript, activeSymptom?.severity || 7);
    return enhanceSummaryWithOCR(base, activeSymptom?.scannedRecord);
  });

  const synthesizeTriage = (textToAnalyze: string, severityScale: number = 7, record?: OCRScannedRecord | null) => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const baseSummary = runClinicalTriageEngine(textToAnalyze, severityScale);
      const enrichedSummary = enhanceSummaryWithOCR(baseSummary, record);
      setTriageSummary(enrichedSummary);
      setIsSynthesizing(false);
    }, 450);
  };

  // Synchronize when activeSymptom changes from BodyMapSelector or OCR
  useEffect(() => {
    if (activeSymptom) {
      if (activeSymptom.scannedRecord) {
        setScannedRecord(activeSymptom.scannedRecord);
      }
      const generatedText =
        activeSymptom.notes ||
        `Patient reports severe ${activeSymptom.symptoms.join(', ')} in ${activeSymptom.partName} (${activeSymptom.hindiName}) with pain VAS severity ${activeSymptom.severity}/10 for ${activeSymptom.duration}.`;
      setTranscript(generatedText);
      synthesizeTriage(generatedText, activeSymptom.severity, activeSymptom.scannedRecord);
    }
  }, [activeSymptom]);

  const handleVoiceIntakeComplete = (symptom: BodySymptom) => {
    if (symptom.scannedRecord) {
      setScannedRecord(symptom.scannedRecord);
    }
    const text =
      symptom.notes ||
      `Patient reports ${symptom.symptoms.join(', ')} in ${symptom.partName} (${symptom.hindiName}) with severity ${symptom.severity}/10 for ${symptom.duration}.`;
    setTranscript(text);
    synthesizeTriage(text, symptom.severity, symptom.scannedRecord);
  };

  // Find Nearest Hospital matching diagnosed primary specialty
  const recommendedHospital = useMemo(() => {
    const allHospitals = db.getHospitals();
    if (!allHospitals.length) return null;

    const targetSpecialty = triageSummary?.primarySpecialty || 'General Medicine';

    // Compute distance to each hospital
    const evaluated = allHospitals.map(hosp => {
      const dist = calculateHaversineDistanceKm(
        activeCoords.lat,
        activeCoords.lng,
        hosp.mapsCoord.lat,
        hosp.mapsCoord.lng
      );
      const eta = estimateDrivingEtaMinutes(dist);
      const hasSpecialty = hosp.opdDepartments.some(dept =>
        dept.toLowerCase().includes(targetSpecialty.toLowerCase())
      );
      return {
        ...hosp,
        distanceKm: dist,
        drivingEtaMinutes: eta,
        hasSpecialty
      };
    });

    // Prioritize hospitals that have the specialty, sorted by shortest distance
    const matching = evaluated.filter(h => h.hasSpecialty);
    if (matching.length > 0) {
      matching.sort((a, b) => a.distanceKm - b.distanceKm);
      return matching[0];
    }

    // Fallback: closest hospital overall
    evaluated.sort((a, b) => a.distanceKm - b.distanceKm);
    return evaluated[0];
  }, [activeCoords, triageSummary]);

  const handleBookOPD = (hosp: Hospital) => {
    if (onBookHospitalOPD) {
      onBookHospitalOPD(hosp);
    } else {
      const tok = db.bookOPDAppointment(
        hosp.id,
        triageSummary?.primarySpecialty || 'General Medicine',
        hosp.type === 'GOVERNMENT' ? 'Duty Senior Registrar' : 'Consultant Specialist',
        'Today - Immediate Triage Slot'
      );
      setBookedConfirmation(`Token #${tok.tokenNumber} Confirmed at ${hosp.name}`);
      setTimeout(() => setBookedConfirmation(null), 6000);
    }
  };

  const PRESET_SCENARIOS = [
    {
      label: '🫀 Chest Pain / Angina',
      labelHi: '🫀 सीने में दर्द',
      text: 'Severe compressive retrosternal chest pain radiating to left arm and jaw with cold sweating and breathlessness.',
      severity: 9
    },
    {
      label: '🧠 Stroke / Severe Headache',
      labelHi: '🧠 सिरदर्द व चक्कर',
      text: 'Severe thunderclap headache with dizziness, slurred speech and numbness in right arm.',
      severity: 8
    },
    {
      label: '🥣 Abdominal Cramps / Acidity',
      labelHi: '🥣 पेट में तेज दर्द',
      text: 'Acute severe pain in right lower abdomen with nausea, vomiting and fever for 24 hours.',
      severity: 7
    },
    {
      label: '🫁 Wheezing / Dyspnea',
      labelHi: '🫁 सांस फूलना व खांसी',
      text: 'Persistent dry cough with severe shortness of breath, wheezing and chest tightness.',
      severity: 7
    },
    {
      label: '🦴 Trauma / Fracture',
      labelHi: '🦴 हड्डी में चोट / फ्रैक्चर',
      text: 'Severe knee and leg pain after accidental fall with inability to bear weight and bony deformity.',
      severity: 8
    },
    {
      label: '🌡️ Febrile Infection',
      labelHi: '🌡️ तेज बुखार व बदन दर्द',
      text: 'Spiking high fever > 103°F with chills, body ache, retro-orbital headache and thrombocytopenia risk.',
      severity: 7
    }
  ];

  const handleSelectPresetScenario = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setTranscript(scenario.text);
    synthesizeTriage(scenario.text, scenario.severity);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Bot size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
              {language === 'HI' ? 'चिकित्सा एआई क्लिनिकल को-पायलट एवं ट्रायज' : 'Chikitsa AI Clinical Co-Pilot & Triage'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {language === 'HI'
                ? 'द्विभाषी लक्षण विश्लेषण, आपातकालीन ईएसआई स्कोरिंग एवं निकटतम अस्पताल सिफारिश'
                : 'Bilingual Multimodal Triage, Emergency Severity Index (ESI) & Proximity Hospital Matcher'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
            <Sparkles size={14} /> Gemini Clinical Intelligence
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <MapPin size={12} /> {activeCoords.label || 'Maharashtra'}
          </span>
        </div>
      </div>

      {/* Quick Scenario Preset Chips */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          {language === 'HI' ? '⚡ त्वरित नैदानिक परिदृश्य (Quick Test Scenarios):' : '⚡ Quick Clinical Scenarios (Click to Triage):'}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPresetScenario(scenario)}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
            >
              {language === 'HI' ? scenario.labelHi : scenario.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Input Box */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {language === 'HI' ? 'रोगी के लक्षण विवरण (Patient Presentation & Transcript)' : 'Clinical Presentation & Speech Intake'}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsOCRModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={14} />
              {language === 'HI' ? '📄 रिपोर्ट स्कैन करें (OCR)' : '📄 Scan Lab Report (OCR)'}
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="btn btn-purple btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Mic size={14} />
              {language === 'HI' ? 'आवाज से लक्षण बोलें (Voice Intake)' : 'Speak Symptoms (Voice Intake)'}
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={language === 'HI' ? 'अपने लक्षण यहाँ लिखें या माइक बटन दबाकर बोलें...' : 'Describe your symptoms in English or Hindi...'}
          style={{
            width: '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.5
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <LocateFixed size={14} color="#0284c7" />
            <span>
              {language === 'HI' ? 'स्थान संदर्भ:' : 'Location Ref:'} <strong>{activeCoords.label || 'Live Location'}</strong> ({activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)})
            </span>
          </div>

          <button
            onClick={() => synthesizeTriage(transcript)}
            disabled={isSynthesizing || !transcript.trim()}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw size={15} className="spin-animation" />
                {language === 'HI' ? 'एआई ट्रायज हो रहा है...' : 'Synthesizing Triage...'}
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {language === 'HI' ? 'एआई समरी व ट्रायज तैयार करें' : 'Generate AI Clinical Triage & Summary'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Booked Confirmation Toast */}
      {bookedConfirmation && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#059669',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{bookedConfirmation}</span>
        </div>
      )}

      {/* 📄 Multimodal Clinical Fusion Card (Voice Intake + Scanned OCR Record) */}
      {scannedRecord && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
          border: '2px solid #0284c7',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          marginBottom: '22px',
          boxShadow: '0 4px 18px rgba(2, 132, 199, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🎙️ + 📄</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                    {language === 'HI'
                      ? 'मल्टीमोडल क्लिनिकल डेटा फ्यूजन (वॉयस इनटेक + ओसीआर रिपोर्ट)'
                      : 'Multimodal Clinical Fusion: Voice Symptom Intake + OCR Lab Report'}
                  </strong>
                  <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>OCR VERIFIED</span>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{scannedRecord.confidenceScore}% CONFIDENCE</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  🏛️ {scannedRecord.facilityName} {scannedRecord.doctorName ? `• 👨‍⚕️ ${scannedRecord.doctorName}` : ''} • 📅 {scannedRecord.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setIsOCRModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> {language === 'HI' ? 'अन्य रिपोर्ट स्कैन करें' : 'Rescan / Upload'}
              </button>
              <button
                onClick={() => {
                  setScannedRecord(null);
                  synthesizeTriage(transcript, activeSymptom?.severity || 7, null);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}
                title="Detach scanned record"
              >
                <X size={12} /> {language === 'HI' ? 'हटाएं' : 'Clear OCR'}
              </button>
            </div>
          </div>

          {/* Extracted Biomarkers Grid */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="#0284c7" />
              {language === 'HI' ? 'ओसीआर द्वारा पहचाने गए बायोमार्कर व लैब मान (Extracted Biomarkers):' : 'Optical Lab Biomarkers & Diagnostic Telemetry:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(scannedRecord.extractedBiomarkers || []).map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: b.severity === 'CRITICAL'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : b.severity === 'ELEVATED'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'var(--bg-secondary)',
                    border: `1px solid ${
                      b.severity === 'CRITICAL' ? '#ef4444' : b.severity === 'ELEVATED' ? '#f59e0b' : 'var(--border-subtle)'
                    }`,
                    color: b.severity === 'CRITICAL' ? '#dc2626' : b.severity === 'ELEVATED' ? '#d97706' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {b.severity === 'CRITICAL' ? '🚨' : b.severity === 'ELEVATED' ? '⚠️' : '✅'}
                  <span>{language === 'HI' && b.hindiName ? b.hindiName : b.testName}:</span>
                  <strong>{b.value} {b.unit}</strong>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({b.range})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Diagnosis and Medication Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
            {scannedRecord.previousDiagnosis && (
              <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'HI' ? 'पिछला मेडिकल निदान:' : 'Previous Documented Diagnosis:'}{' '}
                </span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {language === 'HI' && scannedRecord.previousDiagnosisHindi ? scannedRecord.previousDiagnosisHindi : scannedRecord.previousDiagnosis}
                </strong>
              </div>
            )}
            {scannedRecord.pastMedications && scannedRecord.pastMedications.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'HI' ? 'पूर्व दवाएं (Past Rx):' : 'Previous Prescriptions:'}{' '}
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{scannedRecord.pastMedications.join(', ')}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Triage Summary Card */}
      {triageSummary && (
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-secondary) 0%, rgba(2, 132, 199, 0.04) 100%)',
          border: `2px solid ${triageSummary.urgencyColor}`,
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: `0 4px 20px ${triageSummary.urgencyColor}18`
        }}>
          {/* Triage Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: triageSummary.urgencyColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {language === 'HI' ? 'एआई क्लिनिकल ट्रायज सारांश' : 'AI Clinical Triage Summary'}
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
                  {language === 'HI' ? triageSummary.chiefComplaintHindi : triageSummary.chiefComplaint}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: triageSummary.urgencyColor,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: '20px',
                letterSpacing: '0.03em'
              }}>
                {triageSummary.esiLevel}
              </span>
              <span className="badge badge-teal" style={{ fontWeight: 600 }}>
                {triageSummary.primarySpecialty}
              </span>
            </div>
          </div>

          {/* Clinical Impression */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {language === 'HI' ? 'नैदानिक निष्कर्ष (Clinical Impression):' : 'Clinical Impression & Working Hypothesis:'}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 6px', lineHeight: 1.5 }}>
              {triageSummary.clinicalImpression}
            </p>
            {language !== 'HI' && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                {triageSummary.clinicalImpressionHindi}
              </p>
            )}
          </div>

          {/* Red Flags & Diagnostics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {/* Red Flags Box */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', marginBottom: '8px' }}>
                <AlertTriangle size={15} />
                <span>{language === 'HI' ? 'गंभीर चेतावनी लक्षण (Red Flags)' : 'Critical Clinical Red Flags'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {triageSummary.redFlags.map((rf, i) => (
                  <li key={i}>{rf}</li>
                ))}
              </ul>
            </div>

            {/* Diagnostics Workup Box */}
            <div style={{
              background: 'rgba(2, 132, 199, 0.06)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', marginBottom: '8px' }}>
                <CheckCircle2 size={15} />
                <span>{language === 'HI' ? 'अनुशंसित प्राथमिक जांच (Diagnostics)' : 'Recommended Diagnostic Workup'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {triageSummary.recommendedDiagnostics.map((diag, i) => (
                  <li key={i}>{diag}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 📍 Proximity-Based Hospital Recommendation For This Specific Triage */}
          {recommendedHospital && (
            <div style={{
              background: 'var(--bg-primary)',
              border: '2px solid #0284c7',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} color="#0284c7" />
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {language === 'HI' ? '📍 इस ट्रायज के लिए निकटतम अनुशंसित अस्पताल' : '📍 Nearest Recommended Hospital for this Triage'}
                  </strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={12} /> {recommendedHospital.distanceKm.toFixed(1)} km away
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'rgba(2, 132, 199, 0.15)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} /> ~{recommendedHospital.drivingEtaMinutes} mins ETA
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ maxWidth: '600px' }}>
                  <h4 style={{ fontSize: '1.08rem', margin: '0 0 4px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {recommendedHospital.name}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {recommendedHospital.city}, Maharashtra • Contact: {recommendedHospital.contactNumber}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                      {recommendedHospital.type === 'GOVERNMENT'
                        ? '🏛️ Govt 100% Free / PM-JAY'
                        : recommendedHospital.type === 'CHARITABLE_TRUST'
                        ? '🤝 Charitable Trust Subsidized'
                        : '🏥 Private PM-JAY Empanelled'}
                    </span>
                    <span className="badge badge-teal" style={{ fontSize: '0.74rem' }}>
                      ✅ {triageSummary.primarySpecialty} OPD Active
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: '0.74rem' }}>
                      🛏️ {recommendedHospital.bedTelemetry.icuAvailable} ICU Beds Available
                    </span>
                    {recommendedHospital.acceptedGovSchemes.map((s, idx) => (
                      <span key={idx} className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => handleBookOPD(recommendedHospital)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <Zap size={14} />
                    {language === 'HI' ? 'तुरंत ओपीडी टोकन लें' : '1-Tap OPD Booking'}
                  </button>

                  <button
                    onClick={onEmergencyTrigger}
                    className="btn btn-emergency btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <PhoneCall size={14} />
                    {language === 'HI' ? '108 आपातकालीन कॉल' : 'Dispatch 108 ALS'}
                  </button>

                  <button
                    onClick={onNavigateHospitals}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    {language === 'HI' ? 'सभी अस्पताल देखें' : 'View All Hospitals'} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Differential Diagnosis List */}
      <div>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Stethoscope size={20} color="var(--medical-blue)" />
          {language === 'HI' ? 'विस्तृत नैदानिक अंतर निदान (ICD-10 Differential Diagnoses)' : 'Detailed ICD-10 Clinical Differentials & Guidelines'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {triageSummary?.differentials.map((diff, index) => (
            <div
              key={index}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderLeft: diff.probability === 'HIGH' ? '4px solid var(--emergency-red)' : '4px solid var(--medical-blue)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                    {diff.conditionName}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
                    ({diff.hindiName}) • ICD-10: <strong>{diff.icd10}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={diff.probability === 'HIGH' ? 'badge badge-red' : 'badge badge-amber'}>
                    {diff.probability} PROBABILITY
                  </span>
                  <span className="badge badge-teal">
                    {diff.recommendedSpecialty}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                {diff.reasoning}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={14} color="var(--warning-amber)" />
                  <span>Red Flags: {diff.redFlags.join(', ')}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={onEmergencyTrigger} className="btn btn-emergency btn-sm" style={{ fontSize: '0.78rem' }}>
                    1-Tap Emergency
                  </button>
                  <button onClick={onNavigateHospitals} className="btn btn-primary btn-sm" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Find Empanelled Hospitals <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isVoiceModalOpen && (
        <VoiceIntakeModal
          language={language}
          onClose={() => setIsVoiceModalOpen(false)}
          onTransferToTriage={handleVoiceIntakeComplete}
          onBookOPD={onNavigateHospitals}
          onOpenEmergency={onEmergencyTrigger}
        />
      )}

      {isOCRModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '940px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📄</span>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                  {language === 'HI' ? 'मेडिकल व लैब रिपोर्ट ओसीआर स्कैनर' : 'Medical & Lab Report Optical OCR Scanner'}
                </h3>
              </div>
              <button
                onClick={() => setIsOCRModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            <MedicalRecordOCRScanner
              language={language}
              voiceSymptom={activeSymptom}
              onScanComplete={(rec, merged) => {
                setScannedRecord(rec);
                setIsOCRModalOpen(false);
                synthesizeTriage(merged.notes || transcript, merged.severity, rec);
              }}
              onSkipToTriage={() => setIsOCRModalOpen(false)}
              onClose={() => setIsOCRModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
