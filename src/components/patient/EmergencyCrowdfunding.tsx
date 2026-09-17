import React, { useState } from 'react';
import type { AppLanguage, CrowdfundingCampaign } from '../../types';
import { db } from '../../db/database';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  onClose: () => void;
}

export const EmergencyCrowdfunding: React.FC<Props> = ({ language, onClose }) => {
  const [campaign, setCampaign] = useState<CrowdfundingCampaign>(() => db.getCrowdfundingCampaign());
  const [donationAmount, setDonationAmount] = useState<number>(500);

  const percentRaised = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

  const handleDonate = () => {
    const updated = db.contributeToCrowdfunding(donationAmount);
    setCampaign(updated);
    confetti({ particleCount: 100, spread: 70 });
    alert(`Thank you! ₹${donationAmount} donated successfully to ${campaign.patientName}'s verified surgery fund!`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeartHandshake size={22} color="var(--medical-teal)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'सत्यापित आपातकालीन मेडिकल क्राउडफंडिंग' : 'Hospital-Verified Emergency Medical Crowdfunding'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕ Close</button>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-green">
              <ShieldCheck size={12} /> Hospital Estimate Verified
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {campaign.daysRemaining} days left
            </span>
          </div>

          <h4 style={{ fontSize: '1.1rem', margin: '4px 0 6px', color: 'var(--text-main)' }}>
            Help {campaign.patientName} undergo {campaign.diagnosis}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {campaign.story}
          </p>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              <span>Raised: ₹{campaign.raisedAmount.toLocaleString()}</span>
              <span>Target: ₹{campaign.targetAmount.toLocaleString()} ({percentRaised}%)</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${percentRaised}%`, background: 'var(--success-emerald)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {campaign.donorCount} verified donors have contributed
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[200, 500, 1000, 2500].map(amt => (
            <button
              key={amt}
              onClick={() => setDonationAmount(amt)}
              className={donationAmount === amt ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ flex: 1 }}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <button onClick={handleDonate} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          <HeartHandshake size={18} /> Donate ₹{donationAmount} via UPI / NetBanking
        </button>
      </div>
    </div>
  );
};
