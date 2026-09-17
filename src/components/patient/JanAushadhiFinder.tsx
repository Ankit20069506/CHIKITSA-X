import React, { useState } from 'react';
import type { GenericDrugMapping, AppLanguage } from '../../types';
import { Pill, Phone, ShieldCheck } from 'lucide-react';

interface Props {
  drugs: GenericDrugMapping[];
  language: AppLanguage;
}

export const JanAushadhiFinder: React.FC<Props> = ({ drugs, language }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrugs = drugs.filter(d =>
    d.brandedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.genericMolecule.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBranded = filteredDrugs.reduce((sum, d) => sum + d.brandedPrice, 0);
  const totalGeneric = filteredDrugs.reduce((sum, d) => sum + d.janAushadhiPrice, 0);
  const totalSaved = totalBranded - totalGeneric;
  const overallSavingsPercent = totalBranded > 0 ? ((totalSaved / totalBranded) * 100).toFixed(1) : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Pill size={24} color="var(--medical-teal)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {language === 'HI' ? 'प्रधानमंत्री जन औषधि केंद्र जेनरिक दवा बचत' : 'PMBJP Jan Aushadhi Generic Medicine Cost-Savings Engine'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {language === 'HI' ? 'ब्रांडेड दवाओं की तुलना में 70% से 88% की सीधी बचत' : 'Compare branded prescriptions against WHO-GMP certified generic equivalents'}
            </p>
          </div>
        </div>
        <span className="badge badge-green">
          <ShieldCheck size={13} /> Govt. Certified Generic
        </span>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 148, 136, 0.08) 100%)',
        border: '1px solid var(--success-emerald)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'HI' ? 'औसत दवा खर्च में बचत' : 'Aggregate Out-of-Pocket Prescription Savings'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-emerald)' }}>
            ₹{totalSaved.toLocaleString()} Saved ({overallSavingsPercent}% Lower Cost)
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Branded: ₹{totalBranded} ➔ Jan Aushadhi Generic: ₹{totalGeneric}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nearest Empanelled Kendra:</div>
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>Pradhan Mantri Jan Aushadhi Kendra #4012, Baner</strong>
          </div>
          <a href="tel:18001808080" className="btn btn-secondary btn-sm">
            <Phone size={14} /> Call Kendra
          </a>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'HI' ? 'दवा या बीमारी का नाम खोजें (उदा. Augmentin, Atorva, BP, Sugar)...' : 'Search by branded medicine, molecule, or category (e.g. Augmentin, Lipitor, Diabetes)...'}
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.9rem',
            color: 'var(--text-main)'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {filteredDrugs.map(drug => (
          <div
            key={drug.id}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span className="badge badge-teal" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>{drug.category}</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {drug.brandedName}
                </div>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                -{drug.savingsPercentage}%
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--medical-blue)', fontWeight: 600, marginBottom: '10px' }}>
              Generic: {drug.genericMolecule} ({drug.dosage})
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Branded MRP:</div>
                <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: 600 }}>₹{drug.brandedPrice}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--success-emerald)', fontWeight: 700 }}>Jan Aushadhi Price:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success-emerald)' }}>₹{drug.janAushadhiPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
