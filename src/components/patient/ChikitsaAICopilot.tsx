import React, { useState } from 'react';
import type { AppLanguage, TriageDifferential, BodySymptom } from '../../types';
import { Bot, Mic, MicOff, AlertTriangle, ChevronRight, Stethoscope, Sparkles } from 'lucide-react';

interface Props {
  language: AppLanguage;
  activeSymptom?: BodySymptom | null;
  onNavigateHospitals: () => void;
  onEmergencyTrigger: () => void;
}

export const ChikitsaAICopilot: React.FC<Props> = ({
  language,
  activeSymptom,
  onNavigateHospitals,
  onEmergencyTrigger
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(
    activeSymptom
      ? `Patient reports severe ${activeSymptom.symptoms.join(', ')} in ${activeSymptom.partName} (${activeSymptom.hindiName}) with pain VAS severity ${activeSymptom.severity}/10 for ${activeSymptom.duration}.`
      : 'Severe chest tightness radiating to left shoulder with breathlessness and cold sweating on climbing stairs for 3 days.'
  );

  const [differentials, setDifferentials] = useState<TriageDifferential[]>([
    {
      conditionName: 'Acute Coronary Syndrome / Angina Pectoris',
      hindiName: 'हृदय की धमनियों में रुकावट (एंजाइना / हृदय रोग)',
      icd10: 'I20.9',
      probability: 'HIGH',
      urgency: 'URGENT_OPD',
      recommendedSpecialty: 'Cardiology (Interventional)',
      reasoning: 'Retrosternal chest pressure radiating to left arm with exertional dyspnea is a classical presentation of myocardial ischemia in NYHA Class II-III.',
      redFlags: ['Radiation to jaw/arm', 'Diaphoresis (cold sweat)', 'Exertional trigger']
    },
    {
      conditionName: 'Gastroesophageal Reflux with Spasm',
      hindiName: 'एसिडिटी एवं अन्नप्रणाली में ऐंठन (जीईआरडी)',
      icd10: 'K21.9',
      probability: 'MODERATE',
      urgency: 'ROUTINE_CONSULT',
      recommendedSpecialty: 'Gastroenterology',
      reasoning: 'Can mimic ischemic chest discomfort, but absence of postprandial burning makes cardiac etiology the priority rule-out.',
      redFlags: ['Heartburn after meals', 'Water brash']
    }
  ]);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setTranscript('मुझे पिछले 3 दिनों से सीने में तेज भारीपन और चलने पर सांस फूलने की समस्या हो रही है।');
      }, 3500);
    }
  };

  const handleAnalyzeNewTranscript = () => {
    setDifferentials([
      {
        conditionName: 'Suspected Angina Pectoris / Ischemic Heart Disease',
        hindiName: 'संदिग्ध एंजाइना / इस्केमिक हृदय रोग',
        icd10: 'I20.9',
        probability: 'HIGH',
        urgency: 'URGENT_OPD',
        recommendedSpecialty: 'Cardiology',
        reasoning: 'Exertional chest constriction coupled with elevated age and risk factors requires immediate ECG, 2D-ECHO, and Troponin evaluation.',
        redFlags: ['Substernal crushing feeling', 'Relief on rest', 'Breathlessness']
      },
      {
        conditionName: 'Costochondritis / Musculoskeletal Chest Wall Pain',
        hindiName: 'छाती की मांसपेशियों में सूजन व खिंचाव',
        icd10: 'M94.0',
        probability: 'LOW',
        urgency: 'ROUTINE_CONSULT',
        recommendedSpecialty: 'Internal Medicine',
        reasoning: 'Tenderness localized to ribs without radiation, benign etiology once cardiac pathology is ruled out.',
        redFlags: ['Pain on localized pressure']
      }
    ]);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'चिकित्सा एआई क्लिनिकल को-पायलट' : 'Chikitsa AI Clinical Co-Pilot'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI' ? 'द्विभाषी आवाज इनटेक एवं अंतर निदान (Differential Diagnosis)' : 'Multimodal Conversational Intake & ICD-10 Differential Triage'}
            </p>
          </div>
        </div>
        <span className="badge badge-teal">
          <Sparkles size={13} /> Gemini Clinical Intelligence
        </span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {language === 'HI' ? 'रोगी के लक्षण विवरण (Patient Transcript)' : 'Clinical Presentation & Speech Intake'}
          </label>
          <button
            onClick={handleVoiceToggle}
            className={isListening ? 'btn btn-emergency btn-sm' : 'btn btn-primary btn-sm'}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            {isListening
              ? (language === 'HI' ? 'सुन रहा है... (Listening)' : 'Listening...')
              : (language === 'HI' ? 'आवाज से बोलें' : 'Speak Symptoms')}
          </button>
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
            padding: '10px 14px',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px' }}>
          <button onClick={handleAnalyzeNewTranscript} className="btn btn-primary btn-sm">
            <Sparkles size={15} /> {language === 'HI' ? 'एआई विश्लेषण करें' : 'Synthesize AI Clinical Triage'}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stethoscope size={18} color="var(--medical-blue)" />
          {language === 'HI' ? 'एआई अंतर निदान एवं सिफारिशें (Differential Diagnosis)' : 'AI Clinical Differential Findings & Specialty Guidance'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {differentials.map((diff, index) => (
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
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {diff.conditionName}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
                    ({diff.hindiName}) • ICD-10: <strong>{diff.icd10}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={diff.probability === 'HIGH' ? 'badge badge-red' : 'badge badge-amber'}>
                    {diff.probability} PROBABILITY
                  </span>
                  <span className="badge badge-teal">
                    {diff.recommendedSpecialty}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                {diff.reasoning}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={14} color="var(--warning-amber)" />
                  <span>Red Flags: {diff.redFlags.join(', ')}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={onEmergencyTrigger} className="btn btn-emergency btn-sm">
                    1-Tap Emergency
                  </button>
                  <button onClick={onNavigateHospitals} className="btn btn-primary btn-sm">
                    Find Empanelled Hospitals <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
