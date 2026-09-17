import React from 'react';
import type { AppLanguage, DrugInteractionWarning } from '../../types';
import { ShieldCheck, AlertOctagon, CheckCircle } from 'lucide-react';

interface Props {
  language: AppLanguage;
}

export const MedicationSafetyChecker: React.FC<Props> = ({ language }) => {
  const currentMedications = [
    { name: 'Atorvastatin 10mg', category: 'Lipid Lowering / Statin', frequency: 'OD (Bedtime)' },
    { name: 'Telmisartan 40mg', category: 'Antihypertensive (ARB)', frequency: 'OD (Morning)' }
  ];

  const interactions: DrugInteractionWarning[] = [
    {
      drugA: 'Atorvastatin 10mg',
      drugB: 'Clarithromycin 500mg',
      severity: 'HIGH',
      description: 'CYP3A4 inhibition increases statin serum concentration by up to 300%, elevating the risk of severe rhabdomyolysis and myopathy.',
      actionRequired: 'Avoid co-administration. Substitute with Azithromycin or withhold Statin during antibiotic course.'
    },
    {
      drugA: 'Telmisartan 40mg',
      drugB: 'Ibuprofen / NSAIDs',
      severity: 'MODERATE',
      description: 'NSAIDs may attenuate the antihypertensive effect and induce acute renal impairment via renal prostaglandin inhibition.',
      actionRequired: 'Substitute NSAID with Paracetamol for analgesia. Monitor Blood Pressure and Serum Potassium.'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} color="var(--success-emerald)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'दवा सुरक्षा एवं ड्रग इंटरेक्शन चेकर' : 'Medication Safety & Drug-Drug Interaction (DDI) Engine'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI' ? 'मरीज की वर्तमान दवाओं और नई पर्ची के बीच परस्पर क्रियाओं की रीयल-टाइम जांच' : 'Real-time contraindication screening across active prescriptions'}
            </p>
          </div>
        </div>
        <span className="badge badge-green">
          <CheckCircle size={13} /> Active Clinical Guard
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {language === 'HI' ? 'सक्रिय दवाइयां (Current Active Medications):' : 'Current Patient Baseline Regimen:'}
        </h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {currentMedications.map(med => (
            <div
              key={med.name}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{med.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{med.category} • {med.frequency}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {interactions.map((warn, i) => (
          <div
            key={i}
            style={{
              background: warn.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
              border: warn.severity === 'HIGH' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={18} color={warn.severity === 'HIGH' ? 'var(--emergency-red)' : 'var(--warning-amber)'} />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {warn.drugA} + {warn.drugB}
                </strong>
              </div>
              <span className={warn.severity === 'HIGH' ? 'badge badge-red' : 'badge badge-amber'}>
                {warn.severity} RISK
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
              {warn.description}
            </p>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
              <strong>Clinical Action:</strong> {warn.actionRequired}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
