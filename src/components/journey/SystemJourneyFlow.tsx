import React, { useState } from 'react';
import type { AppLanguage, UserRole } from '../../types';
import {
  UserCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  CheckCircle2,
  Bot,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Video,
  FileText,
  Activity,
  Droplet
} from 'lucide-react';

interface Props {
  language: AppLanguage;
  onNavigateToPersona: (role: UserRole, targetTab?: string, subTab?: string) => void;
}

interface JourneyStepItem {
  step: number;
  title: string;
  hindiTitle: string;
  desc: string;
  agent: string;
  role: UserRole;
  tab: string;
  subTab?: string;
  icon: any;
}

export const SystemJourneyFlow: React.FC<Props> = ({
  language,
  onNavigateToPersona
}) => {
  const [selectedPersona, setSelectedPersona] = useState<UserRole>('PATIENT');

  const patientSteps: JourneyStepItem[] = [
    {
      step: 1,
      title: 'Multilingual Voice Intake',
      hindiTitle: 'आवाज से लक्षण पंजीकरण',
      desc: 'Patient speaks in Hindi, Hinglish, or English. AI transcribes and extracts chief complaints & duration.',
      agent: 'AGENT-TRIAGE-04 (NLP Scribe)',
      role: 'PATIENT',
      tab: 'PATIENT_PORTAL',
      subTab: 'AI_VOICE',
      icon: Activity
    },
    {
      step: 2,
      title: 'Body Map & AI Differential Triage',
      hindiTitle: '2D बॉडी मैप एवं एआई निदान',
      desc: 'Pinpoints anatomical pain coordinates (Head, Chest, Abdomen) with VAS severity & ICD-10 predictions.',
      agent: 'AGENT-TRIAGE-04 (Clinical Triage)',
      role: 'PATIENT',
      tab: 'PATIENT_PORTAL',
      subTab: 'AI_INTAKE',
      icon: Sparkles
    },
    {
      step: 3,
      title: 'Live OPD Token & Queue Tracker',
      hindiTitle: 'लाइव ओपीडी डिजिटल टोकन',
      desc: 'Generates digital appointment token with live queue tracking, estimated wait time, and doctor delays.',
      agent: 'AGENT-OPD-01 (Queue Sync)',
      role: 'PATIENT',
      tab: 'PATIENT_PORTAL',
      subTab: 'QUEUE',
      icon: CheckCircle2
    },
    {
      step: 4,
      title: 'ABHA 2.0 & FHIR Records Wallet',
      hindiTitle: 'आभा 2.0 राष्ट्रीय स्वास्थ्य वॉलेट',
      desc: 'Accesses 14-digit ABHA card, verified QR health pass, and encrypted FHIR R4 EHR documents.',
      agent: 'AGENT-TRIAGE-04 (FHIR Sync)',
      role: 'PATIENT',
      tab: 'PATIENT_PORTAL',
      subTab: 'ABHA',
      icon: ShieldCheck
    },
    {
      step: 5,
      title: 'PM-JAY & Cashless FinTech Stacking',
      hindiTitle: 'आयुष्मान भारत व कैशलेस बीमा',
      desc: 'Stacks PM-JAY ₹5L cover, state health schemes, TPA cashless pre-auth & 0% medical loan gap protection.',
      agent: 'AGENT-FIN-05 (Pre-Auth Evaluator)',
      role: 'PATIENT',
      tab: 'PATIENT_PORTAL',
      subTab: 'FINTECH',
      icon: CreditCard
    }
  ];

  const doctorSteps: JourneyStepItem[] = [
    {
      step: 1,
      title: 'Live OPD Queue & Patient Intake',
      hindiTitle: 'लाइव ओपीडी प्रतीक्षालय व टोकन',
      desc: 'Doctor reviews live token line, patient symptom summary, and prior ABHA health records.',
      agent: 'AGENT-OPD-01 (Queue Dispenser)',
      role: 'DOCTOR',
      tab: 'DOCTOR_PORTAL',
      icon: UserCheck
    },
    {
      step: 2,
      title: 'Telehealth Video & Live Vitals HUD',
      hindiTitle: 'टेलीहेल्थ वीडियो व लाइव वाइटल्स',
      desc: 'Conducts encrypted video consultation with real-time patient vitals streaming (HR, SpO2, Blood Pressure).',
      agent: 'AGENT-BED-02 (Telemetry Streamer)',
      role: 'DOCTOR',
      tab: 'DOCTOR_PORTAL',
      icon: Video
    },
    {
      step: 3,
      title: 'Ambient AI SOAP Clinical Scribe',
      hindiTitle: 'एम्बिएंट एआई क्लिनिकल स्क्राइब',
      desc: 'Listens to patient-doctor dialogue and transcribes into structured Subjective, Objective, Assessment, Plan notes.',
      agent: 'AGENT-TRIAGE-04 (Speech NLP)',
      role: 'DOCTOR',
      tab: 'DOCTOR_PORTAL',
      icon: FileText
    },
    {
      step: 4,
      title: 'Digitally-Signed QR e-Prescription',
      hindiTitle: 'डिजिटल हस्ताक्षरित क्यूआर पर्चा',
      desc: 'Issues tamper-proof QR e-prescription with automatic Jan Aushadhi generic equivalents (78%-88% savings).',
      agent: 'AGENT-FIN-05 (Generic Drug Engine)',
      role: 'DOCTOR',
      tab: 'DOCTOR_PORTAL',
      icon: ShieldCheck
    }
  ];

  const hospitalSteps: JourneyStepItem[] = [
    {
      step: 1,
      title: 'Hospital ROHINI Registration & Onboarding',
      hindiTitle: 'अस्पताल रोहिणी पंजीकरण व सत्यापन',
      desc: 'Registers new hospital with ROHINI registry ID, NABH accreditation level, and PM-JAY empanelment.',
      agent: 'Master Database Core',
      role: 'HOSPITAL_ADMIN',
      tab: 'HOSPITAL_PORTAL',
      icon: Building2
    },
    {
      step: 2,
      title: 'Trauma ICU & Bed Telemetry HUD',
      hindiTitle: 'आईसीयू, वेंटिलेटर व ऑक्सीजन बेड टेलीमेट्री',
      desc: 'Monitors real-time ICU, ventilator, and oxygen bed occupancy with automated trauma surge alerts.',
      agent: 'AGENT-BED-02 (Bed Sentinel)',
      role: 'HOSPITAL_ADMIN',
      tab: 'HOSPITAL_PORTAL',
      icon: Activity
    },
    {
      step: 3,
      title: 'Blood Bank Stock & Donor Radar',
      hindiTitle: 'ब्लड बैंक स्टॉक एवं डोनर रडार',
      desc: 'Tracks unit counts across 8 blood groups and triggers instant emergency donor calls when reserves dip.',
      agent: 'AGENT-BLOOD-03 (Blood Radar)',
      role: 'HOSPITAL_ADMIN',
      tab: 'HOSPITAL_PORTAL',
      icon: Droplet
    },
    {
      step: 4,
      title: '1-Tap Emergency SOS Radar & TPA Desk',
      hindiTitle: '1-टैप इमरजेंसी एसओएस व टीपीए डेस्क',
      desc: 'GPS ambulance dispatch with 5-second siren countdown, trauma bed reservation, and cashless insurance sanction.',
      agent: 'AGENT-FIN-05 (TPA Cashless)',
      role: 'HOSPITAL_ADMIN',
      tab: 'HOSPITAL_PORTAL',
      icon: Zap
    }
  ];

  const currentSteps =
    selectedPersona === 'PATIENT' ? patientSteps :
    selectedPersona === 'DOCTOR' ? doctorSteps : hospitalSteps;

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(13, 148, 136, 0.08) 50%, rgba(147, 51, 234, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.15)', color: 'var(--medical-blue)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '10px' }}>
          <Sparkles size={13} /> UNIFIED END-TO-END CARE ECOSYSTEM
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
          {language === 'HI' ? 'सिस्टम जर्नी पाथ (मरीज, डॉक्टर व अस्पताल)' : 'System Journey Path (Patient, Doctor & Hospital)'}
        </h2>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.5 }}>
          {language === 'HI'
            ? 'देखें कैसे मरीज का वॉयस इनटेक, डॉक्टर का एआई स्क्राइब और अस्पताल का आईसीयू रडार एक ही सेंट्रलाइज्ड डेटाबेस व ऑटोनॉमस एजेंट्स के साथ रीयल-टाइम में कनेक्टेड हैं।'
            : 'Explore how patient symptoms, doctor clinical consultations, and hospital bed telemetry interconnect seamlessly through autonomous background agents and the master database.'}
        </p>
      </div>

      {/* Persona Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'PATIENT', label: language === 'HI' ? '🧍 मरीज जर्नी (Patient Journey)' : '🧍 Patient Care Journey', color: '#0284c7' },
          { id: 'DOCTOR', label: language === 'HI' ? '🩺 डॉक्टर जर्नी (Doctor Journey)' : '🩺 Doctor Clinical Journey', color: '#0d9488' },
          { id: 'HOSPITAL_ADMIN', label: language === 'HI' ? '🏥 अस्पताल कमांड जर्नी (Hospital Journey)' : '🏥 Hospital Command Journey', color: '#9333ea' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p.id as any)}
            className={selectedPersona === p.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Journey Steps Path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {currentSteps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid var(--medical-blue)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '680px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--medical-blue-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--medical-blue)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {item.title}
                    </h3>
                    <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
                      {item.hindiTitle}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Bot size={13} style={{ color: 'var(--accent-green)' }} />
                    Powered by Autonomous Swarm: <strong style={{ color: 'var(--text-main)' }}>{item.agent}</strong>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => onNavigateToPersona(item.role as any, item.tab, item.subTab)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Experience This Step <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
