import React from 'react';
import type { LabBiomarker, AppLanguage } from '../../types';
import { TestTube2, Sparkles } from 'lucide-react';

interface Props {
  biomarkers: LabBiomarker[];
  language: AppLanguage;
}

export const LabReportAnalyzer: React.FC<Props> = ({ biomarkers, language }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TestTube2 size={24} color="var(--medical-teal)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'स्मार्ट लैब रिपोर्ट बायोमार्कर विश्लेषक' : 'Smart Lab Biomarker & Diagnostic Analyzer'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI' ? 'रक्त परीक्षण मूल्यों का दृश्य ग्राफ एवं सरल हिंदी/अंग्रेजी व्याख्या' : 'Visual range indicators, abnormality alerts & layman explanations'}
            </p>
          </div>
        </div>
        <span className="badge badge-teal">
          <Sparkles size={13} /> Optical & FHIR Lab Parser
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {biomarkers.map((bio, index) => {
          const isCritical = bio.status === 'CRITICAL_HIGH';
          const isElevated = bio.status === 'ELEVATED';

          const minVal = bio.normalRange[0] * 0.7;
          const maxVal = bio.normalRange[1] * 1.3;
          const percentage = Math.min(100, Math.max(5, ((bio.value - minVal) / (maxVal - minVal)) * 100));

          return (
            <div
              key={index}
              style={{
                background: 'var(--bg-secondary)',
                border: isCritical ? '1px solid var(--emergency-red)' : isElevated ? '1px solid var(--warning-amber)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {bio.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {bio.hindiName}
                  </div>
                </div>

                <span className={isCritical ? 'badge badge-red' : isElevated ? 'badge badge-amber' : 'badge badge-green'}>
                  {bio.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isCritical ? 'var(--emergency-red)' : isElevated ? 'var(--warning-amber)' : 'var(--medical-teal)' }}>
                  {bio.value}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {bio.unit} (Normal: {bio.normalRange[0]} - {bio.normalRange[1]} {bio.unit})
                </span>
              </div>

              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', position: 'relative', margin: '12px 0 8px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    borderRadius: '4px',
                    background: isCritical ? 'var(--emergency-red)' : isElevated ? 'var(--warning-amber)' : 'var(--medical-teal)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                {language === 'HI' ? bio.hindiInterpretation : bio.interpretation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
