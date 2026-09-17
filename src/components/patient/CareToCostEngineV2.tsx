import React, { useState } from 'react';
import type { CareCostAssessment, AppLanguage } from '../../types';
import { db } from '../../db/database';
import { Wallet, CheckCircle2, Zap, Percent, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  onOpenEMI: (gapAmount: number) => void;
  onOpenCrowdfunding: () => void;
}

export const CareToCostEngineV2: React.FC<Props> = ({ language, onOpenEMI, onOpenCrowdfunding }) => {
  const [procedureCost, setProcedureCost] = useState<number>(185000);
  const [hasPMJAY, setHasPMJAY] = useState<boolean>(true);
  const [hasMJPJAY, setHasMJPJAY] = useState<boolean>(true);
  const [hasPrivateInsurance, setHasPrivateInsurance] = useState<boolean>(true);
  const [hasNGOAid, setHasNGOAid] = useState<boolean>(true);

  const assessment: CareCostAssessment = db.calculateFinancialGap(
    procedureCost,
    hasPMJAY,
    hasMJPJAY,
    hasPrivateInsurance,
    hasNGOAid
  );

  const totalSubsidized = assessment.pmjaySubsidy + assessment.stateSchemeSubsidy + assessment.privateInsuranceClaim + assessment.ngoCharitableGrant;
  const subsidyPercent = ((totalSubsidized / assessment.indicativeGrossCost) * 100).toFixed(0);

  const handleApplyCashless = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    alert('Pre-authorization request automatically sent to Ayushman Bharat PM-JAY & Insurer TPA desk!');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Wallet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'केयर-टू-कॉस्ट 2.0 वित्तीय अंतर कैलकुलेटर' : 'Care-to-Cost 2.0 FinTech Financial Gap Engine'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI' ? 'आयुष्मान भारत, राज्य योजना, बीमा एवं एनजीओ सहायता का रीयल-टाइम समायोजन' : 'Automated multi-scheme stacking: PM-JAY ₹5L + MJPJAY + TPA Insurance + NGO Grants'}
            </p>
          </div>
        </div>
        <span className="badge badge-green">
          <Zap size={13} /> Real-Time Pre-Auth
        </span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Indicative Treatment Cost:
            </label>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{procedureCost.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Angioplasty & Stent', cost: 185000 },
              { label: 'Knee Replacement', cost: 240000 },
              { label: 'Appendectomy', cost: 65000 },
              { label: 'Chemotherapy Cycle', cost: 120000 }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => setProcedureCost(p.cost)}
                className={procedureCost === p.cost ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasPMJAY} onChange={e => setHasPMJAY(e.target.checked)} />
            Ayushman Bharat PM-JAY (₹5 Lakhs)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasMJPJAY} onChange={e => setHasMJPJAY(e.target.checked)} />
            MJPJAY State Health Scheme
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasPrivateInsurance} onChange={e => setHasPrivateInsurance(e.target.checked)} />
            Private TPA Cashless Insurance
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={hasNGOAid} onChange={e => setHasNGOAid(e.target.checked)} />
            Tata Trusts / NGO Charitable Fund
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PM-JAY Cashless</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medical-teal)' }}>-₹{assessment.pmjaySubsidy.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Govt. Central Grant</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>State Scheme Subsidy</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medical-blue)' }}>-₹{assessment.stateSchemeSubsidy.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MJPJAY Maharashtra</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Private Insurance</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>-₹{assessment.privateInsuranceClaim.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TPA Cashless Pre-Auth</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Charitable NGO Aid</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning-amber)' }}>-₹{assessment.ngoCharitableGrant.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tata Trusts / Foundation</div>
        </div>
      </div>

      <div style={{
        background: assessment.isCompletelyCashless
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 148, 136, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
        border: assessment.isCompletelyCashless ? '2px solid var(--success-emerald)' : '2px solid var(--warning-amber)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'HI' ? 'मरीज का अंतिम शुद्ध भुगतान (Net Out-Of-Pocket Gap)' : 'Patient Net Out-of-Pocket Financial Gap'}
            </span>
            <span className={assessment.isCompletelyCashless ? 'badge badge-green' : 'badge badge-amber'}>
              {assessment.isCompletelyCashless ? '100% Zero-Gap Cashless' : `${subsidyPercent}% Subsidized`}
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: assessment.isCompletelyCashless ? 'var(--success-emerald)' : 'var(--warning-amber)' }}>
            ₹{assessment.netFinancialGap.toLocaleString()}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {assessment.isCompletelyCashless
              ? 'Congratulations! Complete treatment covered under empaneled government & charitable healthcare pools.'
              : `Remaining gap of ₹${assessment.netFinancialGap.toLocaleString()} can be bridged via 0% EMI or Verified Emergency Crowdfunding.`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {assessment.isCompletelyCashless ? (
            <button onClick={handleApplyCashless} className="btn btn-primary btn-lg">
              <CheckCircle2 size={18} /> Apply 100% Cashless Pass
            </button>
          ) : (
            <>
              <button onClick={() => onOpenEMI(assessment.netFinancialGap)} className="btn btn-primary">
                <Percent size={16} /> 0% Interest EMI
              </button>
              <button onClick={onOpenCrowdfunding} className="btn btn-secondary">
                <HeartHandshake size={16} /> Emergency Crowdfunding
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
