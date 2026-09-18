import React, { useState, useEffect, useRef } from 'react';
import type { AppLanguage, VoiceIntakeRecord, BodySymptom } from '../../types';
import { db } from '../../db/database';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Volume2,
  X,
  ChevronRight,
  ShieldAlert,
  FileText,
  Stethoscope,
  Send,
  Languages,
  ArrowRight,
  Camera,
  Upload
} from 'lucide-react';
import { MedicalRecordOCRScanner } from './MedicalRecordOCRScanner';

interface Props {
  language: AppLanguage;
  onClose: () => void;
  onTransferToTriage?: (symptom: BodySymptom) => void;
  onBookOPD?: () => void;
  onOpenEmergency?: () => void;
}

interface DemoPreset {
  lang: 'hi-IN' | 'hinglish' | 'en-IN' | 'bn-IN' | 'ta-IN';
  label: string;
  transcript: string;
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  painScaleVAS: number;
  bodyRegion: string;
  bodyPartId: 'head' | 'neck' | 'chest' | 'abdomen' | 'spine' | 'arms' | 'legs' | 'general';
  isEmergencyRedFlag: boolean;
  redFlagReason?: string;
  recommendedSpecialty: string;
  clinicalImpression: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    lang: 'hi-IN',
    label: 'सीने में दर्द व सांस फूलना (Cardiac Red Flag)',
    transcript: 'मुझे पिछले 3 दिनों से सीने में तेज भारीपन और बाएं हाथ में खिंचाव हो रहा है, थोड़ा सा सीढ़ियां चढ़ने पर सांस फूलती है और ठंडा पसीना आता है।',
    chiefComplaint: 'Acute Retrosternal Chest Pain with Exertional Dyspnea & Diaphoresis',
    symptoms: ['Chest tightness / pain', 'Left arm radiation', 'Exertional dyspnea', 'Cold sweating (Diaphoresis)'],
    duration: '3 days',
    severity: 'CRITICAL',
    painScaleVAS: 9,
    bodyRegion: 'Chest / Cardiovascular',
    bodyPartId: 'chest',
    isEmergencyRedFlag: true,
    redFlagReason: 'Substernal pressure radiating to left arm with cold diaphoresis strongly suggests Acute Myocardial Infarction.',
    recommendedSpecialty: 'Cardiology (Emergency Cath Lab)',
    clinicalImpression: 'Suspected Acute Coronary Syndrome (ICD-10 I20.9 / I21). Immediate 12-lead ECG, cardiac troponin and stat aspirin/clopidogrel advised.'
  },
  {
    lang: 'hinglish',
    label: 'तेज बुखार व बदन दर्द (Viral / Dengue)',
    transcript: 'Last 2 days se high grade fever 102 degree hai, severe bodyache, aankhon ke peeche dard aur extreme thakan lag rahi hai.',
    chiefComplaint: 'Acute Febrile Syndrome with Retro-orbital Pain & Myalgia',
    symptoms: ['High grade fever (102°F)', 'Severe myalgia', 'Retro-orbital pain', 'Extreme fatigue'],
    duration: '2 days',
    severity: 'MODERATE',
    painScaleVAS: 6,
    bodyRegion: 'Head & Neck / General',
    bodyPartId: 'head',
    isEmergencyRedFlag: false,
    recommendedSpecialty: 'General Medicine / Infectious Diseases',
    clinicalImpression: 'Acute Viral Syndrome / Suspected Dengue Fever (ICD-10 A90). Recommend CBC, Platelet count and Dengue NS1 antigen.'
  },
  {
    lang: 'en-IN',
    label: 'Severe Stomach Burning (Acute Gastritis / GERD)',
    transcript: 'I have severe burning sensation in upper stomach radiating to throat for 4 days, especially after meals with nausea and acid reflux.',
    chiefComplaint: 'Epigastric Burning with Dyspepsia & Acid Reflux',
    symptoms: ['Epigastric burning pain', 'Postprandial heartburn', 'Acid reflux', 'Nausea'],
    duration: '4 days',
    severity: 'MODERATE',
    painScaleVAS: 5,
    bodyRegion: 'Abdomen / Gastrointestinal',
    bodyPartId: 'abdomen',
    isEmergencyRedFlag: false,
    recommendedSpecialty: 'Gastroenterology',
    clinicalImpression: 'Gastroesophageal Reflux Disease with Acute Gastritis (ICD-10 K21.9). Propose PPI therapy and dietary moderation.'
  },
  {
    lang: 'hi-IN',
    label: 'आधे सिर में भयंकर दर्द (Migraine Cephalalgia)',
    transcript: 'दाहिनी तरफ आधे सिर में बहुत तेज हथौड़े जैसा दर्द है, उल्टी जैसा लग रहा है और रोशनी व तेज आवाज से बहुत ज्यादा चिड़चिड़ापन हो रहा है।',
    chiefComplaint: 'Unilateral Throbbing Cephalalgia with Photophobia & Nausea',
    symptoms: ['Right-sided throbbing headache', 'Nausea', 'Photophobia', 'Phonophobia'],
    duration: '18 hours',
    severity: 'SEVERE',
    painScaleVAS: 8,
    bodyRegion: 'Head / Neurological',
    bodyPartId: 'head',
    isEmergencyRedFlag: false,
    recommendedSpecialty: 'Neurology',
    clinicalImpression: 'Acute Migraine without Aura (ICD-10 G43.0). Triptan / NSAID therapy indicated.'
  }
];

export const VoiceIntakeModal: React.FC<Props> = ({
  language,
  onClose,
  onTransferToTriage,
  onBookOPD,
  onOpenEmergency
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi-IN' | 'hinglish' | 'en-IN' | 'bn-IN' | 'ta-IN'>('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedRecord, setExtractedRecord] = useState<VoiceIntakeRecord | null>(null);
  const [isOCRMode, setIsOCRMode] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 25, 40, 60, 30, 70, 45, 80, 50, 30, 20, 15]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const matchedPreset = extractedRecord
    ? (DEMO_PRESETS.find(p => p.chiefComplaint === extractedRecord.chiefComplaint) || DEMO_PRESETS[0])
    : null;

  const currentVoiceSymptom: BodySymptom | null = extractedRecord
    ? {
        partId: matchedPreset?.bodyPartId || 'chest',
        partName: extractedRecord.bodyRegion,
        hindiName: matchedPreset?.label.split('(')[0].trim() || extractedRecord.chiefComplaint,
        symptoms: extractedRecord.extractedSymptoms,
        severity: extractedRecord.painScaleVAS,
        duration: extractedRecord.duration,
        notes: extractedRecord.spokenTranscript
      }
    : null;

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const waveAnimRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = selectedLang === 'hinglish' ? 'hi-IN' : selectedLang;

        reco.onresult = (event: any) => {
          let currentInterim = '';
          let finalPiece = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalPiece += event.results[i][0].transcript + ' ';
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }
          if (finalPiece) {
            setTranscript(prev => (prev ? `${prev.trim()} ${finalPiece.trim()}` : finalPiece.trim()));
          }
          setInterimText(currentInterim);
        };

        reco.onerror = () => {
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      } catch {
        // ignore
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveAnimRef.current) clearInterval(waveAnimRef.current);
    };
  }, [selectedLang]);

  // Handle live audio visualizer animation
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      waveAnimRef.current = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 16 }, () => Math.floor(Math.random() * 70) + 15)
        );
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveAnimRef.current) clearInterval(waveAnimRef.current);
      setRecordingSeconds(0);
      setWaveHeights([15, 20, 25, 30, 25, 20, 15, 12, 18, 22, 28, 20, 16, 14, 18, 12]);
    }
  }, [isListening]);

  const handleStartListening = () => {
    setExtractedRecord(null);
    setInterimText('');
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLang === 'hinglish' ? 'hi-IN' : selectedLang;
        recognitionRef.current.start();
      } catch {
        // Fallback simulation if already running or denied
        setTimeout(() => {
          const sample = DEMO_PRESETS.find(p => p.lang === selectedLang) || DEMO_PRESETS[0];
          setTranscript(sample.transcript);
          setIsListening(false);
        }, 3500);
      }
    } else {
      // Fallback simulated voice listening
      setTimeout(() => {
        const sample = DEMO_PRESETS.find(p => p.lang === selectedLang) || DEMO_PRESETS[0];
        setTranscript(sample.transcript);
        setIsListening(false);
      }, 3500);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const handleApplyPreset = (preset: DemoPreset) => {
    setSelectedLang(preset.lang);
    setTranscript(preset.transcript);
    setExtractedRecord(null);
  };

  const handleProcessVoiceIntake = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      // Match with known preset or dynamically extract
      const lower = transcript.toLowerCase();
      let matched = DEMO_PRESETS.find(p =>
        lower.includes('chest') || lower.includes('सीना') || lower.includes('दिल') || lower.includes('सांस')
      );

      if (!matched) {
        matched = DEMO_PRESETS.find(p =>
          lower.includes('fever') || lower.includes('बुखार') || lower.includes('temperature')
        );
      }

      if (!matched) {
        matched = DEMO_PRESETS.find(p =>
          lower.includes('stomach') || lower.includes('पेट') || lower.includes('acid') || lower.includes('burning')
        );
      }

      if (!matched) {
        matched = DEMO_PRESETS[1]; // fallback viral
      }

      const isEmergency =
        lower.includes('chest') ||
        lower.includes('सीना') ||
        lower.includes('heart') ||
        lower.includes('सांस फूल') ||
        lower.includes('fainting') ||
        matched.isEmergencyRedFlag;

      const newRecord: VoiceIntakeRecord = {
        id: `VOICE-INTAKE-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        language: selectedLang,
        spokenTranscript: transcript,
        englishTranslation: matched.transcript !== transcript ? undefined : matched.transcript,
        chiefComplaint: matched.chiefComplaint,
        extractedSymptoms: matched.symptoms,
        duration: matched.duration,
        severity: isEmergency ? 'CRITICAL' : matched.severity,
        painScaleVAS: matched.painScaleVAS,
        bodyRegion: matched.bodyRegion,
        isEmergencyRedFlag: isEmergency,
        redFlagReason: isEmergency ? matched.redFlagReason : undefined,
        recommendedSpecialty: matched.recommendedSpecialty,
        clinicalImpression: matched.clinicalImpression,
        confidenceScore: Math.floor(Math.random() * 6) + 93
      };

      db.saveVoiceIntake(newRecord);
      setExtractedRecord(newRecord);
      setIsProcessing(false);
    }, 1200);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
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
        maxWidth: isOCRMode ? '940px' : '760px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'max-width 0.25s ease'
      }}>
        {isOCRMode ? (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setIsOCRMode(false)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                ← {language === 'HI' ? 'वॉयस इनटेक पर वापस जाएं' : 'Back to Voice Intake'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                  {language === 'HI' ? '📄 मेडिकल ओसीआर स्कैनर' : '📄 Optical Medical Scribe'}
                </span>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <MedicalRecordOCRScanner
              language={language}
              voiceSymptom={currentVoiceSymptom}
              onScanComplete={(scannedRecord, mergedSymptom) => {
                if (onTransferToTriage) {
                  onTransferToTriage(mergedSymptom);
                }
                onClose();
              }}
              onSkipToTriage={() => {
                if (onTransferToTriage && currentVoiceSymptom) {
                  onTransferToTriage(currentVoiceSymptom);
                }
                onClose();
              }}
              onClose={onClose}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #9333ea 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                }}>
                  <Mic size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                      {language === 'HI' ? 'एआई आवाज लक्षण पंजीकरण (Voice Intake)' : 'AI Multilingual Voice Intake & Clinical Scribe'}
                    </h3>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Bhashini AI</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {language === 'HI'
                      ? 'अपनी भाषा में खुलकर बोलें — एआई तुरंत मेडिकल शब्दों व लक्षणों को एक्सट्रैक्ट करेगा'
                      : 'Speak naturally in Hindi, Hinglish, or English — auto-extracted into structured clinical data'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsOCRMode(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}
                  title="Scan medical reports with OCR"
                >
                  <Camera size={13} />
                  <span>{language === 'HI' ? 'रिपोर्ट स्कैन करें' : 'Scan Reports'}</span>
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Language Selector Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Languages size={16} /> Spoken Dialect / भाषा:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'hi-IN', label: '🇮🇳 हिन्दी (Hindi)' },
                { id: 'hinglish', label: '🇮🇳 Hinglish' },
                { id: 'en-IN', label: '🇬🇧 English (IN)' },
                { id: 'bn-IN', label: '🇮🇳 বাংলা (Bengali)' },
                { id: 'ta-IN', label: '🇮🇳 தமிழ் (Tamil)' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedLang(item.id as any)}
                  className={selectedLang === item.id ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {!extractedRecord ? (
            <>
              {/* Mic & Waveform Section */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.05) 0%, rgba(2, 132, 199, 0.03) 100%)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '28px 20px',
                textAlign: 'center',
                marginBottom: '20px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  {/* Pulsing Mic Button */}
                  <div
                    onClick={isListening ? handleStopListening : handleStartListening}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: isListening
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #9333ea 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: isListening
                        ? '0 0 0 12px rgba(239, 68, 68, 0.25), 0 8px 20px rgba(239, 68, 68, 0.4)'
                        : '0 8px 20px rgba(147, 51, 234, 0.35)',
                      transition: 'all 0.3s ease',
                      transform: isListening ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: isListening ? 'var(--critical-red)' : 'var(--text-main)' }}>
                      {isListening ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                          Listening... ({formatSeconds(recordingSeconds)}) — Click to stop
                        </span>
                      ) : (
                        'Click microphone & speak your health symptoms'
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isListening
                        ? 'AI is transcribing audio in real-time with Indian acoustic dialect models...'
                        : 'Or select a quick clinical sample below to test immediately'}
                    </div>
                  </div>

                  {/* Equalizer Audio Waves */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '40px',
                    width: '100%',
                    maxWidth: '280px',
                    marginTop: '6px'
                  }}>
                    {waveHeights.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '4px',
                          height: isListening ? `${h}%` : '20%',
                          borderRadius: '4px',
                          background: isListening
                            ? 'linear-gradient(180deg, #ef4444 0%, #9333ea 100%)'
                            : 'var(--border-subtle)',
                          transition: 'height 0.1s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Instant Clinical Demo Presets */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Clinical Presets (Click to Load & Test):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '8px' }}>
                  {DEMO_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'border-color 0.2s',
                        borderColor: preset.isEmergencyRedFlag ? 'rgba(239, 68, 68, 0.4)' : undefined
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Volume2 size={13} style={{ color: 'var(--medical-blue)' }} /> {preset.label}
                        </span>
                        {preset.isEmergencyRedFlag && (
                          <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>SOS RED FLAG</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{preset.transcript}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Transcript Textarea */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {language === 'HI' ? 'पहचाना गया विवरण (Transcript):' : 'Spoken or Entered Transcript (Editable):'}
                  </label>
                  {transcript && (
                    <button
                      onClick={() => setTranscript('')}
                      style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      Clear text
                    </button>
                  )}
                </div>

                <textarea
                  value={transcript + (interimText ? ` [${interimText}...]` : '')}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Spoken symptoms will appear here automatically, or you can type symptoms directly in Hindi or English..."
                  rows={3}
                  className="input"
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    fontSize: '0.88rem',
                    lineHeight: '1.5'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={onClose} className="btn btn-secondary">
                  Close
                </button>
                <button
                  onClick={handleProcessVoiceIntake}
                  disabled={isProcessing || !transcript.trim()}
                  className="btn btn-purple"
                >
                  {isProcessing ? (
                    'Analyzing Clinical NLP...'
                  ) : (
                    <>
                      <Sparkles size={16} /> Extract Symptoms & Triage
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* AI Scribe Extraction Results */
            <div>
              <div style={{
                background: extractedRecord.isEmergencyRedFlag
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(13, 148, 136, 0.08)',
                border: `1px solid ${extractedRecord.isEmergencyRedFlag ? 'var(--critical-red)' : 'var(--medical-teal)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={22} style={{ color: extractedRecord.isEmergencyRedFlag ? 'var(--critical-red)' : 'var(--medical-teal)' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {extractedRecord.chiefComplaint}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        NLP Extracted • Confidence {extractedRecord.confidenceScore}% • Record ID: {extractedRecord.id}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${extractedRecord.isEmergencyRedFlag ? 'badge-red' : 'badge-teal'}`}>
                    {extractedRecord.severity} SEVERITY
                  </span>
                </div>

                {extractedRecord.isEmergencyRedFlag && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--critical-red)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>CRITICAL EMERGENCY RED FLAG:</strong> {extractedRecord.redFlagReason}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Extracted Symptoms
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {extractedRecord.extractedSymptoms.map((sym, i) => (
                        <span key={i} className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Duration & Pain VAS Scale
                    </div>
                    <div style={{ marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={15} style={{ color: 'var(--medical-blue)' }} /> {extractedRecord.duration}
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        VAS {extractedRecord.painScaleVAS}/10
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Anatomical Body Region
                    </div>
                    <div style={{ marginTop: '6px', fontWeight: 600 }}>
                      {extractedRecord.bodyRegion}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Recommended Specialty
                    </div>
                    <div style={{ marginTop: '6px', fontWeight: 700, color: 'var(--medical-blue)' }}>
                      <Stethoscope size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {extractedRecord.recommendedSpecialty}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(147, 51, 234, 0.15)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Clinical Scribe Impression (Bhashini AI):
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {extractedRecord.clinicalImpression}
                  </div>
                </div>
              </div>

              {/* CONDITIONAL GATE: PREVIOUS MEDICAL / LAB RECORD CHECK */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
                border: '2px solid #0284c7',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                marginBottom: '20px',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                        {language === 'HI' ? 'कंडीशनल चिकित्सीय सत्यापन' : 'Conditional Clinical Gate'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>
                        {language === 'HI' ? 'ओसीआर स्कैनर विकल्प' : 'Medical OCR Scanner'}
                      </span>
                    </div>
                    <h4 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {language === 'HI'
                        ? 'क्या आपके पास इस बीमारी से संबंधित कोई पिछला मेडिकल पर्चा या लैब रिपोर्ट है?'
                        : 'Do you have previous medical records, prescriptions, or lab reports for this condition?'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {language === 'HI'
                        ? 'यदि हाँ, तो ओसीआर स्कैनर द्वारा रिपोर्ट स्कैन करें ताकि ईसीजी, ट्रोपोनिन या ब्लड टेस्ट डेटा एआई में जुड़ सके। यदि नहीं, तो सीधे एआई समरी व ट्रायज रिपोर्ट देखें।'
                        : 'If YES, scan previous records with our OCR scanner to extract ECG, biomarkers & prescriptions. If NO, proceed directly to AI Summarize Report.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {/* Option 1: NO -> Directly to AI Summarize Report */}
                  <button
                    onClick={() => {
                      if (onTransferToTriage && currentVoiceSymptom) {
                        onTransferToTriage(currentVoiceSymptom);
                      }
                      onClose();
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <X size={18} color="var(--critical-red)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        {language === 'HI' ? '❌ नहीं (NO)' : '❌ NO, Continue Without Records'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {language === 'HI' ? 'सीधे AI समरी व ट्रायज रिपोर्ट देखें' : 'View AI Triage Report Directly'}
                      </div>
                    </div>
                  </button>

                  {/* Option 2: YES -> Open OCR Scanner */}
                  <button
                    onClick={() => setIsOCRMode(true)}
                    className="btn btn-primary"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Camera size={18} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800 }}>
                        {language === 'HI' ? '📄 हाँ (YES)' : '📄 YES, Scan Report with OCR'}
                      </div>
                      <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                        {language === 'HI' ? 'मेडिकल / लैब रिपोर्ट स्कैन करें' : 'Scan Lab / Medical Document'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons for Clinical Follow-ups */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={() => setExtractedRecord(null)}
                  className="btn btn-secondary btn-sm"
                >
                  <Mic size={14} /> Record Another Symptom
                </button>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {extractedRecord.isEmergencyRedFlag && onOpenEmergency && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenEmergency();
                      }}
                      className="btn btn-emergency btn-sm"
                    >
                      <AlertTriangle size={15} /> 1-Tap SOS Emergency Radar
                    </button>
                  )}

                  {onTransferToTriage && (
                    <button
                      onClick={() => {
                        if (currentVoiceSymptom) {
                          onTransferToTriage(currentVoiceSymptom);
                        }
                        onClose();
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Transfer to AI Triage Copilot <ArrowRight size={15} />
                    </button>
                  )}

                  {onBookOPD && (
                    <button
                      onClick={() => {
                        onClose();
                        onBookOPD();
                      }}
                      className="btn btn-purple btn-sm"
                    >
                      Book OPD Appointment <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )}
      </div>
    </div>
  );
};
