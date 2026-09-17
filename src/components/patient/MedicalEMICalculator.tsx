import React, { useState } from 'react';
import type { AppLanguage, MedicalEMIOption } from '../../types';
import { db } from '../../db/database';
import { Percent, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  gapAmount: number;
  onClose: () => void;
}

export const MedicalEMICalculator: React.FC<Props> = ({ language, gapAmount, onClose }) => {
  const [selectedTenure, setSelectedTenure] = useState<number>(6);
  const options: MedicalEMIOption[] = db.calculateEMIOptions(gapAmount > 0 ? gapAmount : 45000);
  const activePlan = options.find(o => o.months === selectedTenure) || options[1];

  const handleApplyEMI = () => {
    confetti({ particleCount: 80, spread: 60 });
    alert(`Instant Medical 0% EMI Pre-Approved! Monthly Installment: ₹${activePlan.monthlyAmount} for ${activePlan.months} months. Disbursal code generated.`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Percent size={22} color="var(--medical-blue)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? '0% ब्याज दर मेडिकल ईएमआई लोन' : 'Instant 0% Interest Medical NBFC Financing'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕ Close</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Bridge your remaining hospital gap without collateral. Zero hidden fees, powered by RBI-approved healthcare NBFCs.
        </p>

        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount to Finance</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--medical-blue)' }}>
            ₹{(gapAmount > 0 ? gapAmount : 45000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success-emerald)', fontWeight: 600 }}>
            ★ Zero Processing Fee • Zero Foreclosure Charges
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {options.map(plan => {
            const isSelected = plan.months === selectedTenure;
            return (
              <button
                key={plan.months}
                onClick={() => setSelectedTenure(plan.months)}
                style={{
                  background: isSelected ? 'var(--medical-blue-light)' : 'var(--bg-secondary)',
                  border: isSelected ? '2px solid var(--medical-blue)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 10px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? 'var(--medical-blue)' : 'var(--text-main)' }}>
                  {plan.months} Months
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isSelected ? 'var(--medical-blue)' : 'var(--text-main)', margin: '4px 0' }}>
                  ₹{plan.monthlyAmount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--success-emerald)', fontWeight: 700 }}>
                  0% INTEREST
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleApplyEMI} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          <CheckCircle2 size={18} /> Confirm 0% EMI (₹{activePlan.monthlyAmount}/mo for {activePlan.months} Months)
        </button>
      </div>
    </div>
  );
};
