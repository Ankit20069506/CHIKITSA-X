import React, { useState } from 'react';
import type { AppLanguage, VoiceIntakeRecord, BodySymptom } from '../../types';
import { db } from '../../db/database';
import {
  Mic,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ChevronRight,
  History,
  Languages,
  Plus
} from 'lucide-react';
import { VoiceIntakeModal } from './VoiceIntakeModal';

interface Props {
  language: AppLanguage;
  onTransferToTriage?: (symptom: BodySymptom) => void;
  onBookOPD?: () => void;
  onOpenEmergency?: () => void;
}

export const VoiceIntakeView: React.FC<Props> = ({
  language,
  onTransferToTriage,
  onBookOPD,
  onOpenEmergency
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<VoiceIntakeRecord[]>(() => db.getVoiceIntakeHistory());
  const [selectedRecord, setSelectedRecord] = useState<VoiceIntakeRecord | null>(history[0] || null);

  const refreshHistory = () => {
    const updated = db.getVoiceIntakeHistory();
    setHistory(updated);
    if (updated.length > 0) {
      setSelectedRecord(updated[0]);
    }
  };

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(2, 132, 199, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(147, 51, 234, 0.15)', color: '#9333ea', fontWeight: 700, fontSize: '0.75rem', marginBottom: '10px' }}>
            <Sparkles size={13} /> BHASHINI MULTILINGUAL CLINICAL SCRIBE 2.0
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
            {language === 'HI' ? 'आवाज से लक्षण बताएं (AI Voice Symptom Intake)' : 'Multilingual AI Voice Symptom Intake'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {language === 'HI'
              ? 'हिन्दी, हिंग्लिश या अंग्रेजी में अपनी बीमारी बताएं। एआई तुरंत लक्षण, गंभीरता व रेड फ्लैग्स पहचानकर सही डॉक्टर व ओपीडी से जोड़ेगा।'
              : 'Speak freely in Hindi, Hinglish, or English. AI automatically extracts clinical symptoms, pain severity, and emergency flags.'}
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-purple btn-lg"
            style={{ boxShadow: '0 8px 20px rgba(147, 51, 234, 0.35)' }}
          >
            <Mic size={20} />
            {language === 'HI' ? 'नया वॉयस इनटेक शुरू करें' : 'Start Voice Intake Now'}
          </button>
        </div>
      </div>

      {/* Main Grid: History and Selected Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: Intake History Cards */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} style={{ color: 'var(--medical-blue)' }} />
              {language === 'HI' ? 'हालिया वॉयस इनटेक' : 'Voice Intake History'}
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} /> New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map(item => {
              const isSelected = selectedRecord?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--medical-blue)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(2, 132, 199, 0.06)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {item.timestamp}
                    </span>
                    <span className={`badge ${item.isEmergencyRedFlag ? 'badge-red' : 'badge-teal'}`} style={{ fontSize: '0.65rem' }}>
                      {item.severity}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                    {item.chiefComplaint}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    "{item.spokenTranscript}"
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--medical-blue)', fontWeight: 600 }}>
                      <Stethoscope size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {item.recommendedSpecialty}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      VAS {item.painScaleVAS}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Record Clinical Insights */}
        {selectedRecord && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  RECORD ID: {selectedRecord.id} • {selectedRecord.timestamp}
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                  {selectedRecord.chiefComplaint}
                </h3>
              </div>
              <span className={`badge ${selectedRecord.isEmergencyRedFlag ? 'badge-red' : 'badge-teal'}`}>
                {selectedRecord.severity} SEVERITY
              </span>
            </div>

            {selectedRecord.isEmergencyRedFlag && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
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
                  <strong>CRITICAL EMERGENCY RED FLAG:</strong> {selectedRecord.redFlagReason}
                </div>
              </div>
            )}

            {/* Audio Spoken Transcript Box */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Languages size={13} /> Original Patient Spoken Audio Transcript:
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.5 }}>
                "{selectedRecord.spokenTranscript}"
              </p>
              {selectedRecord.englishTranslation && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>English Clinical Translation:</strong> {selectedRecord.englishTranslation}
                </div>
              )}
            </div>

            {/* Extracted Symptoms Tags */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                Extracted Clinical Symptoms:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedRecord.extractedSymptoms.map((sym, idx) => (
                  <span key={idx} className="badge badge-teal" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Vitals & Region Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Duration</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{selectedRecord.duration}</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pain VAS Scale</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#9333ea' }}>
                  {selectedRecord.painScaleVAS} / 10
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Body Region</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{selectedRecord.bodyRegion}</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Specialist</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: 'var(--medical-blue)' }}>
                  {selectedRecord.recommendedSpecialty.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* AI Scribe Clinical Impression */}
            <div style={{
              background: 'rgba(2, 132, 199, 0.05)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--medical-blue)', marginBottom: '4px' }}>
                AI SCRIBE IMPRESSION & CLINICAL DIRECTIVE:
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedRecord.clinicalImpression}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {selectedRecord.isEmergencyRedFlag && onOpenEmergency && (
                <button onClick={onOpenEmergency} className="btn btn-emergency btn-sm">
                  1-Tap SOS Emergency Radar
                </button>
              )}

              {onTransferToTriage && (
                <button
                  onClick={() => {
                    onTransferToTriage({
                      partId: 'chest',
                      partName: selectedRecord.bodyRegion,
                      hindiName: selectedRecord.chiefComplaint,
                      symptoms: selectedRecord.extractedSymptoms,
                      severity: selectedRecord.painScaleVAS,
                      duration: selectedRecord.duration,
                      notes: selectedRecord.spokenTranscript
                    });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Send to AI Triage Copilot <ArrowRight size={15} />
                </button>
              )}

              {onBookOPD && (
                <button onClick={onBookOPD} className="btn btn-purple btn-sm">
                  Book OPD Appointment <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <VoiceIntakeModal
          language={language}
          onClose={() => {
            setIsModalOpen(false);
            refreshHistory();
          }}
          onTransferToTriage={onTransferToTriage}
          onBookOPD={onBookOPD}
          onOpenEmergency={onOpenEmergency}
        />
      )}
    </div>
  );
};
