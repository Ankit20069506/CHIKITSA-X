import React, { useState } from 'react';
import type { BodySymptom, AppLanguage } from '../../types';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  language: AppLanguage;
  onSymptomSelect: (symptom: BodySymptom) => void;
  onEmergencyTrigger: () => void;
}

interface BodyRegion {
  id: BodySymptom['partId'];
  name: string;
  hindiName: string;
  presetSymptoms: string[];
  isRedFlagWarning?: boolean;
}

const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head',
    name: 'Head & Brain',
    hindiName: 'सिर एवं मस्तिष्क',
    presetSymptoms: ['Severe throbbing headache', 'Sudden dizziness / Vertigo', 'Facial numbness', 'Blurred vision'],
    isRedFlagWarning: true
  },
  {
    id: 'neck',
    name: 'Neck & Throat',
    hindiName: 'गला एवं गर्दन',
    presetSymptoms: ['Difficulty swallowing', 'Swollen lymph nodes', 'Stiff neck with high fever', 'Thyroid discomfort']
  },
  {
    id: 'chest',
    name: 'Chest & Heart',
    hindiName: 'छाती एवं हृदय',
    presetSymptoms: ['Crushing retrosternal chest pain', 'Pain radiating to left arm/jaw', 'Shortness of breath on exertion', 'Palpitations & cold sweating'],
    isRedFlagWarning: true
  },
  {
    id: 'abdomen',
    name: 'Abdomen & GI Tract',
    hindiName: 'पेट एवं पाचन तंत्र',
    presetSymptoms: ['Acute epigastric pain', 'Right lower quadrant pain (Appendix)', 'Persistent vomiting', 'Bloating / Acid reflux']
  },
  {
    id: 'spine',
    name: 'Spine & Lower Back',
    hindiName: 'रीढ़ एवं पीठ',
    presetSymptoms: ['Lumbar disc pain', 'Numbness radiating down leg (Sciatica)', 'Severe morning stiffness', 'Restricted mobility']
  },
  {
    id: 'arms',
    name: 'Shoulders & Arms',
    hindiName: 'कंधे एवं बांह',
    presetSymptoms: ['Rotator cuff tendonitis', 'Joint swelling & redness', 'Loss of grip strength', 'Tremors']
  },
  {
    id: 'legs',
    name: 'Legs, Knees & Feet',
    hindiName: 'पैर, घुटने एवं पंजे',
    presetSymptoms: ['Bilateral knee osteoarthritis', 'Calf tenderness (DVT risk)', 'Diabetic foot numbness', 'Ankle sprain']
  }
];

export const BodyMapSelector: React.FC<Props> = ({ language, onSymptomSelect, onEmergencyTrigger }) => {
  const [selectedPart, setSelectedPart] = useState<BodyRegion>(BODY_REGIONS[2]);
  const [severity, setSeverity] = useState<number>(7);
  const [duration, setDuration] = useState<string>('3-5 Days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Crushing retrosternal chest pain',
    'Shortness of breath on exertion'
  ]);
  const [isEmergencyAlert, setIsEmergencyAlert] = useState<boolean>(true);

  const handlePartClick = (region: BodyRegion) => {
    setSelectedPart(region);
    setSelectedSymptoms(region.presetSymptoms.slice(0, 2));
    setIsEmergencyAlert(!!(region.isRedFlagWarning && severity >= 7));
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleConfirmIntake = () => {
    onSymptomSelect({
      partId: selectedPart.id,
      partName: selectedPart.name,
      hindiName: selectedPart.hindiName,
      symptoms: selectedSymptoms,
      severity,
      duration
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={22} color="var(--medical-teal)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'इंटरैक्टिव मानव शरीर लक्षण चयनकर्ता (Interactive Body Map)' : 'Interactive Anatomical Body Map & Symptom Pinpointer'}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {language === 'HI' 
              ? 'शरीर के प्रभावित अंग पर क्लिक करें और दर्द का स्तर चुनें।'
              : 'Click on the affected body region to pinpoint pain intensity, duration, and clinical symptoms.'}
          </p>
        </div>
        <span className="badge badge-teal">
          <Sparkles size={13} /> AI Clinical Triage 2.0
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language === 'HI' ? 'अंग चुनें (Select Body Part)' : 'Select Anatomical Region'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BODY_REGIONS.map(region => {
              const isSelected = region.id === selectedPart.id;
              return (
                <button
                  key={region.id}
                  onClick={() => handlePartClick(region)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--medical-blue)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--medical-blue-light)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isSelected ? 'var(--medical-blue)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{region.name} <small style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({region.hindiName})</small></span>
                  {region.isRedFlagWarning && (
                    <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Red Flag</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>
              {selectedPart.name} ({selectedPart.hindiName})
            </h4>
            <span className="badge badge-blue">
              Severity: {severity}/10
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {language === 'HI' ? 'दर्द की तीव्रता (Pain Severity Scale 1-10)' : 'Pain Severity (VAS Scale 1-10)'}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSeverity(val);
                setIsEmergencyAlert(!!(selectedPart.isRedFlagWarning && val >= 7));
              }}
              style={{ width: '100%', accentColor: severity >= 8 ? 'var(--emergency-red)' : severity >= 5 ? 'var(--warning-amber)' : 'var(--medical-teal)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>Mild (1-3)</span>
              <span>Moderate (4-6)</span>
              <span style={{ color: 'var(--emergency-red)', fontWeight: 700 }}>Severe / Acute (7-10)</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {language === 'HI' ? 'लक्षणों की अवधि (Duration)' : 'Duration of Symptoms'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Today (Sudden)', '2-4 Days', '1-2 Weeks', 'Chronic (>1 Month)'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: duration === d ? '1px solid var(--medical-blue)' : '1px solid var(--border-subtle)',
                    background: duration === d ? 'var(--medical-blue-light)' : 'var(--bg-primary)',
                    color: duration === d ? 'var(--medical-blue)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: duration === d ? 700 : 400
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {language === 'HI' ? 'विशिष्ट लक्षण चुनें (Select Symptoms)' : 'Clinical Indicators'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedPart.presetSymptoms.map(sym => {
                const checked = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      border: checked ? '1px solid var(--medical-teal)' : '1px solid var(--border-subtle)',
                      background: checked ? 'var(--medical-teal-light)' : 'var(--bg-primary)',
                      color: checked ? 'var(--medical-teal)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: checked ? 600 : 400
                    }}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {isEmergencyAlert && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--emergency-red)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--emergency-red)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--emergency-red)', fontWeight: 600 }}>
                  {language === 'HI' ? 'आपातकालीन चेतावनी: तीव्र लक्षण पहचाने गए' : 'RED FLAG: Severe acute symptoms detected!'}
                </span>
              </div>
              <button onClick={onEmergencyTrigger} className="btn btn-emergency btn-sm">
                1-Tap SOS
              </button>
            </div>
          )}

          <button onClick={handleConfirmIntake} className="btn btn-primary" style={{ width: '100%' }}>
            {language === 'HI' ? 'लक्षण विश्लेषण करें (Analyze Symptoms)' : 'Analyze & Generate AI Triage Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
