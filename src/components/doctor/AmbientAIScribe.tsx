import React, { useState } from 'react';
import type { AppLanguage, SOAPClinicalNote } from '../../types';
import { db } from '../../db/database';
import { Sparkles, Mic, MicOff, FileSignature } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  onClose?: () => void;
  onNoteSaved?: (note: SOAPClinicalNote) => void;
}

export const AmbientAIScribe: React.FC<Props> = ({ language, onClose, onNoteSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [subjective, setSubjective] = useState(
    'Patient presents with 4 days of retrosternal constriction radiating to left shoulder on brisk walking. Relieved with rest. Denies syncope. Mild exertional dyspnea.'
  );
  const [objective, setObjective] = useState(
    'BP: 138/88 mmHg, HR: 82 bpm, SpO2: 98% room air. S1 S2 heard normal, no murmurs. ECG shows sinus rhythm with subtle ST flattening in V4-V6.'
  );
  const [assessment, setAssessment] = useState(
    'Class II Angina Pectoris / Suspected Chronic Coronary Disease with Dyslipidemia (Total Cholesterol 235 mg/dL).'
  );
  const [plan, setPlan] = useState(
    '1. 2D-ECHO and TMT tomorrow.\n2. Start Atorvastatin 20mg HS + Metoprolol 25mg OD.\n3. PM-JAY pre-auth initiated for Angiography if symptoms recur.'
  );

  const handleSimulateScribe = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setSubjective(
        'Patient reports improved comfort today but notes recurring tightness after heavy meals. No orthopnea or PND.'
      );
      setAssessment(
        'Stable Ischemic Heart Disease (CCS Class I-II) under medical titration.'
      );
      confetti({ particleCount: 60, spread: 50 });
    }, 3000);
  };

  const handleSaveNote = () => {
    const saved = db.saveSOAPNote({
      patientId: 'USR-PAT-2026-01',
      doctorName: 'Dr. Rajesh Kulkarni, MD, DM (Cardiology)',
      hospitalName: 'Sassoon General Hospital & Medical College, Pune',
      date: new Date().toISOString().split('T')[0],
      subjective,
      objective,
      assessment,
      plan,
      prescriptions: [
        { medicine: 'Atorvastatin 20mg', dosage: '1 Tab', frequency: 'Bedtime (HS)', duration: '30 Days', genericAlternative: 'Jan Aushadhi Atorvastatin 20mg (₹26)' },
        { medicine: 'Metoprolol Succinate 25mg', dosage: '1 Tab', frequency: 'Morning (OD)', duration: '30 Days', genericAlternative: 'Jan Aushadhi Metoprolol 25mg (₹18)' }
      ]
    });

    confetti({ particleCount: 100, spread: 70 });
    alert(`SOAP Clinical Note & Signed Rx Created! Note ID: ${saved.id} with Digital SHA256 Signature.`);
    if (onNoteSaved) onNoteSaved(saved);
    if (onClose) onClose();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'एंबिएंट एआई क्लिनिकल स्क्राइब' : 'Ambient AI Clinical Consultation Scribe'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Real-time conversational transcription into structured SOAP Notes & Digitally-Signed e-Prescription
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSimulateScribe}
            className={isRecording ? 'btn btn-emergency btn-sm' : 'btn btn-primary btn-sm'}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            {isRecording ? 'Recording Dialogue...' : 'Simulate Ambient Listening'}
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--medical-blue)', marginBottom: '8px' }}>
            [S] SUBJECTIVE (Chief Complaint & HPI)
          </div>
          <textarea
            rows={4}
            value={subjective}
            onChange={e => setSubjective(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px', fontSize: '0.85rem', color: 'var(--text-main)', resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--medical-teal)', marginBottom: '8px' }}>
            [O] OBJECTIVE (Vitals, Physical Exam & Labs)
          </div>
          <textarea
            rows={4}
            value={objective}
            onChange={e => setObjective(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px', fontSize: '0.85rem', color: 'var(--text-main)', resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--warning-amber)', marginBottom: '8px' }}>
            [A] ASSESSMENT (Clinical Impression & ICD-10)
          </div>
          <textarea
            rows={4}
            value={assessment}
            onChange={e => setAssessment(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px', fontSize: '0.85rem', color: 'var(--text-main)', resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--success-emerald)', marginBottom: '8px' }}>
            [P] PLAN (Medications & Scheme Pre-Auth)
          </div>
          <textarea
            rows={4}
            value={plan}
            onChange={e => setPlan(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px', fontSize: '0.85rem', color: 'var(--text-main)', resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🔒 Will be digitally signed with NMC Reg. #489201 and linked to Patient ABHA Record.
        </div>

        <button onClick={handleSaveNote} className="btn btn-primary">
          <FileSignature size={16} /> Sign & Lock Official SOAP Consultation Note
        </button>
      </div>
    </div>
  );
};
