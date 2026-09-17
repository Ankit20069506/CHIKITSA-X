import React, { useState, useEffect } from 'react';
import type {
  AppLanguage,
  GovSchemeInfo,
  InsurancePolicyClaim,
  NGOGrantProgram,
  CareCostAssessment,
  CSRCareProgram,
  CSRApplication
} from '../../types';
import { db } from '../../db/database';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  FileText,
  Clock,
  Zap,
  Sparkles,
  Download,
  Filter,
  DollarSign,
  ChevronRight,
  Shield,
  HelpCircle,
  Award,
  Briefcase,
  TrendingUp,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CSRApplicationModal } from './CSRApplicationModal';

interface Props {
  language: AppLanguage;
  onOpenEMI?: (gapAmount: number) => void;
  onOpenCrowdfunding?: () => void;
}

export const CareFinanceHub: React.FC<Props> = ({
  language,
  onOpenEMI,
  onOpenCrowdfunding
}) => {
  const [activeTab, setActiveTab] = useState<'SCHEMES' | 'INSURANCE' | 'NGO' | 'STACKING'>('SCHEMES');

  // Government Schemes State
  const govSchemes = db.getGovernmentSchemes();
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [rationCardType, setRationCardType] = useState<'YELLOW_BPL' | 'ORANGE_APL' | 'WHITE' | 'NONE'>('YELLOW_BPL');
  const [annualIncome, setAnnualIncome] = useState<number>(95000);

  // Insurance State
  const [policies, setPolicies] = useState<InsurancePolicyClaim[]>(() => db.getInsurancePolicies());
  const [preAuthProcedure, setPreAuthProcedure] = useState<string>('Coronary Angioplasty (DES)');
  const [preAuthAmount, setPreAuthAmount] = useState<number>(180000);
  const [preAuthInsurer, setPreAuthInsurer] = useState<string>(policies[0]?.policyNumber || '');
  const [preAuthSuccess, setPreAuthSuccess] = useState<InsurancePolicyClaim | null>(null);
  const [isPreAuthSubmitting, setIsPreAuthSubmitting] = useState<boolean>(false);

  // NGO & CSR State
  const ngoGrants = db.getNGOGrants();
  const [ngoCategoryFilter, setNgoCategoryFilter] = useState<string>('ALL');
  const [appliedGrantId, setAppliedGrantId] = useState<string | null>(null);
  const [csrPrograms, setCsrPrograms] = useState<CSRCareProgram[]>(() => db.getCSRPrograms());
  const [csrApplications, setCsrApplications] = useState<CSRApplication[]>(() => db.getCSRApplications());
  const [isCSRModalOpen, setIsCSRModalOpen] = useState<boolean>(false);
  const [selectedCSRForModal, setSelectedCSRForModal] = useState<CSRCareProgram | null>(null);
  const [ngoSubTab, setNgoSubTab] = useState<'CSR_CORPORATE' | 'CHARITABLE_TRUSTS' | 'MY_APPLICATIONS' | 'CO_FUNDING'>('CSR_CORPORATE');

  useEffect(() => {
    const unsub = db.subscribe('csr', () => {
      setCsrApplications(db.getCSRApplications());
      setCsrPrograms(db.getCSRPrograms());
    });
    return unsub;
  }, []);

  // Multi-Scheme Stacking State
  const [procedureCost, setProcedureCost] = useState<number>(220000);
  const [hasPMJAY, setHasPMJAY] = useState<boolean>(true);
  const [hasStateScheme, setHasStateScheme] = useState<boolean>(true);
  const [hasPrivateInsurance, setHasPrivateInsurance] = useState<boolean>(true);
  const [hasNGOAid, setHasNGOAid] = useState<boolean>(true);

  const assessment: CareCostAssessment = db.calculateFinancialGap(
    procedureCost,
    hasPMJAY,
    hasStateScheme,
    hasPrivateInsurance,
    hasNGOAid
  );

  const totalSubsidized =
    assessment.pmjaySubsidy +
    assessment.stateSchemeSubsidy +
    assessment.privateInsuranceClaim +
    assessment.ngoCharitableGrant;

  const handleSimulatePreAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreAuthSubmitting(true);
    setTimeout(() => {
      const updated = db.simulateTPAApproval(preAuthInsurer, preAuthAmount);
      setPreAuthSuccess(updated);
      setPolicies(db.getInsurancePolicies());
      setIsPreAuthSubmitting(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }, 1500);
  };

  const handleApplyGrant = (grantId: string) => {
    setAppliedGrantId(grantId);
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
  };

  const filteredSchemes = govSchemes.filter(s => {
    if (selectedState === 'ALL') return true;
    if (s.level === 'CENTRAL') return true;
    return s.state?.toLowerCase().includes(selectedState.toLowerCase());
  });

  const filteredNGOs = ngoGrants.filter(n => {
    if (ngoCategoryFilter === 'ALL') return true;
    return n.focusArea === ngoCategoryFilter;
  });

  return (
    <div>
      {/* Mega Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 132, 199, 0.08) 50%, rgba(147, 51, 234, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '10px' }}>
              <Sparkles size={13} /> 100% CASHLESS FINANCIAL HEALTH SHIELD
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
              {language === 'HI'
                ? 'सरकारी योजनाएं, स्वास्थ्य बीमा व एनजीओ सहायता केंद्र'
                : 'Government Schemes, Insurance & NGO Support Hub'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.5 }}>
              {language === 'HI'
                ? 'आयुष्मान भारत ₹5 लाख, राज्य स्वास्थ्य योजनाएं, टीपीए कैशलेस प्री-ऑथराइजेशन, टाटा ट्रस्ट मेडिकल सहायता और 0% ब्याज ईएमआई का एक एकीकृत समाधान।'
                : 'Stack Ayushman Bharat PM-JAY ₹5L, state schemes, cashless private insurance claims, verified NGO grants, and 0% interest medical loans.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ayushman PM-JAY Cover</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-green)' }}>₹5,00,000</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Cashless e-KYC Active</div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Private Insurance</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--medical-blue)' }}>₹10,00,000</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Medi Assist TPA Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'SCHEMES', icon: Building2, label: language === 'HI' ? '🏛️ सरकारी योजनाएं (PM-JAY / RAN)' : '🏛️ Government Schemes (PM-JAY & State)' },
          { id: 'INSURANCE', icon: ShieldCheck, label: language === 'HI' ? '🛡️ स्वास्थ्य बीमा व TPA कैशलेस' : '🛡️ Health Insurance & Cashless TPA' },
          { id: 'NGO', icon: HeartHandshake, label: language === 'HI' ? '🤝 एनजीओ व कॉर्पोरेट CSR केयर' : '🤝 NGO & Corporate CSR Care' },
          { id: 'STACKING', icon: CreditCard, label: language === 'HI' ? '💳 बिल स्टैकिंग व 0% ईएमआई' : '💳 Multi-Scheme Stacking & 0% EMI' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={isActive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOVERNMENT HEALTH SCHEMES */}
      {activeTab === 'SCHEMES' && (
        <div>
          {/* Eligibility Filter Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Filter size={16} style={{ color: 'var(--medical-blue)' }} />
                Check Scheme Eligibility by Profile:
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    State of Residence:
                  </label>
                  <select
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                    className="input"
                    style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All India (Central + States)</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    Ration Card Type:
                  </label>
                  <select
                    value={rationCardType}
                    onChange={e => setRationCardType(e.target.value as any)}
                    className="input"
                    style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                  >
                    <option value="YELLOW_BPL">Yellow / BPL / Antyodaya (Eligible for All)</option>
                    <option value="ORANGE_APL">Orange / Non-BPL (State Scheme Eligible)</option>
                    <option value="WHITE">White Card</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    Annual Family Income:
                  </label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={e => setAnnualIncome(Number(e.target.value))}
                    className="input"
                    style={{ fontSize: '0.82rem', padding: '4px 8px', width: '110px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schemes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {filteredSchemes.map(scheme => (
              <div
                key={scheme.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${scheme.level === 'CENTRAL' ? 'var(--accent-green)' : 'var(--medical-blue)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span className={`badge ${scheme.level === 'CENTRAL' ? 'badge-green' : 'badge-teal'}`} style={{ fontSize: '0.68rem', marginBottom: '6px' }}>
                        {scheme.level === 'CENTRAL' ? '🇮🇳 Central Govt Scheme' : `🏛️ State Govt (${scheme.state})`}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0 2px' }}>
                        {scheme.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {scheme.hindiName}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Annual Cover</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                        ₹{(scheme.maxCoverAmount / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Eligibility Target:</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{scheme.eligibleCategory}</div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Key Scheme Benefits:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {scheme.keyBenefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Required Verification Documents:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {scheme.requiredDocs.map((doc, i) => (
                        <span key={i} className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                          <FileText size={10} style={{ marginRight: '3px' }} /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> Helpline: <strong>{scheme.tollFreeHelpline}</strong>
                  </div>

                  <a
                    href={scheme.applicationPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Official Portal <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HEALTH INSURANCE & CASHLESS TPA PRE-AUTH */}
      {activeTab === 'INSURANCE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Active Policies List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--medical-blue)' }} />
              Linked Health Insurance Policies
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {policies.map(policy => (
                <div
                  key={policy.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                        {policy.insurerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Policy No: {policy.policyNumber} • TPA: {policy.tpaName}
                      </div>
                    </div>
                    <span className={`badge ${policy.preAuthStatus === 'APPROVED' ? 'badge-green' : policy.preAuthStatus === 'IN_REVIEW' ? 'badge-amber' : 'badge-teal'}`}>
                      {policy.preAuthStatus}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Sum Insured</span>
                      <div style={{ fontWeight: 700 }}>₹{policy.sumInsured.toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Remaining Balance</span>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹{policy.remainingSum.toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Co-Payment</span>
                      <div style={{ fontWeight: 700 }}>{policy.coPayPercent}%</div>
                    </div>
                  </div>

                  {policy.preAuthStatus === 'APPROVED' && (
                    <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Pre-Auth Sanctioned: <strong>₹{policy.sanctionedAmount.toLocaleString()}</strong> (Ref: {policy.claimReferenceNo})</span>
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click TPA Cashless Pre-Auth Simulator */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medical-blue)' }}>
                <Zap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                  Instant Cashless Pre-Auth Simulator
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Simulate live TPA desk approval before hospital admission
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulatePreAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Select Health Insurance Policy:
                </label>
                <select
                  value={preAuthInsurer}
                  onChange={e => setPreAuthInsurer(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {policies.map(p => (
                    <option key={p.id} value={p.policyNumber}>
                      {p.insurerName} ({p.policyNumber}) - Bal: ₹{p.remainingSum.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Planned Medical Procedure / Admission:
                </label>
                <select
                  value={preAuthProcedure}
                  onChange={e => setPreAuthProcedure(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="Coronary Angioplasty (DES)">Coronary Angioplasty (DES)</option>
                  <option value="Total Knee Replacement">Total Knee Replacement</option>
                  <option value="Laparoscopic Cholecystectomy">Laparoscopic Cholecystectomy</option>
                  <option value="Oncology Chemotherapy Cycle">Oncology Chemotherapy Cycle</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Estimated Treatment Amount (₹):
                </label>
                <input
                  type="number"
                  value={preAuthAmount}
                  onChange={e => setPreAuthAmount(Number(e.target.value))}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={isPreAuthSubmitting}
                className="btn btn-primary"
                style={{ marginTop: '8px' }}
              >
                {isPreAuthSubmitting ? 'Transmitting to TPA Gateway...' : 'Simulate 1-Tap Cashless Pre-Auth'}
                <Zap size={15} />
              </button>
            </form>

            {preAuthSuccess && (
              <div style={{
                marginTop: '18px',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--accent-green)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} /> Pre-Authorization Approved!
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <div><strong>TPA Sanction Letter No:</strong> {preAuthSuccess.claimReferenceNo}</div>
                  <div><strong>Approved Amount:</strong> ₹{preAuthSuccess.sanctionedAmount.toLocaleString()} (100% Cashless)</div>
                  <div><strong>Network Hospital Desk:</strong> Apollo / Fortis / AIIMS Empaneled</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NGO & CORPORATE CSR CARE SUPPORT */}
      {activeTab === 'NGO' && (
        <div>
          {/* Top CSR & NGO Metrics Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(2, 132, 199, 0.08) 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>SECTION 135 COMPANIES ACT</span>
                <span className="live-dot" style={{ backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct Hospital Billing Credit</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800 }}>
                {language === 'HI'
                  ? 'कॉर्पोरेट सीएसआर (CSR) व एनजीओ मेडिकल सहायता केंद्र'
                  : 'Corporate CSR & Humanitarian NGO Healthcare Support Hub'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
                {language === 'HI'
                  ? 'टाटा ट्रस्ट्स, रिलायंस फाउंडेशन व इन्फोसिस जैसी अग्रणी कंपनियों के सीएसआर फंड द्वारा गंभीर बीमारियों (कैंसर, बाल हृदय रोग, अंग प्रत्यारोपण) हेतु सीधे अस्पताल खाते में अनुदान।'
                  : 'Empowering BPL & critical illness patients with direct hospital sponsorships from Tata Trusts, Reliance Foundation, Infosys Foundation & verified NGOs.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setSelectedCSRForModal(null);
                  setIsCSRModalOpen(true);
                }}
                className="btn btn-purple"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
              >
                <Plus size={16} />
                {language === 'HI' ? '+ सीएसआर सहायता आवेदन करें' : '+ Apply for Corporate CSR Aid'}
              </button>
            </div>
          </div>

          {/* Key Metrics Counters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '22px'
          }}>
            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #9333ea' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total CSR Healthcare Corpus</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9333ea', marginTop: '2px' }}>₹185 Crores</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sec 135 Mandatory Reserves</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Direct Hospital Disbursements</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>₹42.8 Crores</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>100% Cashless to Hospital Desk</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--medical-blue)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Critical Lives Supported</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--medical-blue)', marginTop: '2px' }}>1,840+ Patients</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Oncology & Pediatric Cardiac</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--warning-amber)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>My CSR Applications</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning-amber)', marginTop: '2px' }}>{csrApplications.length} Sanctioned</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Active Beneficiary Pass</div>
            </div>
          </div>

          {/* CSR / NGO Sub-Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            marginBottom: '20px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'CSR_CORPORATE', label: language === 'HI' ? '🏢 कॉर्पोरेट सीएसआर फंड (Sec 135)' : '🏢 Corporate CSR Sponsorships' },
              { id: 'CHARITABLE_TRUSTS', label: language === 'HI' ? '🤝 चैरिटेबल ट्रस्ट व एनजीओ' : '🤝 Humanitarian NGO Grants' },
              { id: 'MY_APPLICATIONS', label: language === 'HI' ? `📋 मेरे आवेदन व स्वीकृति पत्र (${csrApplications.length})` : `📋 My CSR Applications (${csrApplications.length})` },
              { id: 'CO_FUNDING', label: language === 'HI' ? '🛡️ PM-JAY + CSR जीरो-गैप सुरक्षा' : '🛡️ PM-JAY + CSR Zero-Gap Matrix' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setNgoSubTab(sub.id as any)}
                className={ngoSubTab === sub.id ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: CORPORATE CSR PROGRAMS */}
          {ngoSubTab === 'CSR_CORPORATE' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {csrPrograms.map(prog => (
                <div
                  key={prog.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid #9333ea',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.66rem' }}>
                            {prog.corporateLogoText}
                          </span>
                          <span className="badge badge-teal" style={{ fontSize: '0.64rem' }}>
                            {prog.corporateTier.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 style={{ margin: '2px 0', fontSize: '1.15rem', fontWeight: 800 }}>
                          {prog.corporateName}
                        </h4>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--medical-blue)' }}>
                          {prog.programTitle}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {prog.hindiTitle}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Grant / Patient</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                          ₹{prog.maxGrantPerPatient.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {prog.focusAreas.map(f => (
                        <span key={f} style={{
                          fontSize: '0.68rem',
                          background: 'rgba(2, 132, 199, 0.1)',
                          color: 'var(--medical-blue)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>

                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>Criteria:</strong> {prog.criteria}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                      <div>Empanelled: <strong>{prog.empanelledHospitals.join(', ')}</strong></div>
                      <div>Contact: {prog.nodalContact}</div>
                      <div>Fast-Track Approval: <strong>⚡ ~{prog.avgApprovalHours} Hours</strong></div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ Stacks with PM-JAY ₹5L
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCSRForModal(prog);
                        setIsCSRModalOpen(true);
                      }}
                      className="btn btn-purple btn-sm"
                    >
                      Apply for CSR Aid <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB 2: CHARITABLE TRUSTS */}
          {ngoSubTab === 'CHARITABLE_TRUSTS' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Verified Charitable Trusts & Humanitarian Relief:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'ALL', label: 'All Grants' },
                    { id: 'CANCER', label: 'Cancer Care' },
                    { id: 'CARDIAC_PEDIATRIC', label: 'Child Heart Surgeries' },
                    { id: 'KIDNEY_DIALYSIS', label: 'Kidney Dialysis' },
                    { id: 'GENERAL_BPL', label: 'BPL Relief' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNgoCategoryFilter(cat.id)}
                      className={ngoCategoryFilter === cat.id ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {filteredNGOs.map(ngo => {
                  const isApplied = appliedGrantId === ngo.id;
                  return (
                    <div
                      key={ngo.id}
                      className="glass-panel"
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderLeft: '4px solid #9333ea'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <span className="badge badge-purple" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>
                              {ngo.focusArea.replace('_', ' ')}
                            </span>
                            <h4 style={{ margin: '4px 0 2px', fontSize: '1.1rem', fontWeight: 800 }}>
                              {ngo.orgName}
                            </h4>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--medical-blue)' }}>
                              {ngo.programTitle}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {ngo.hindiTitle}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Grant Aid</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                              ₹{ngo.maxGrantAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong>Criteria:</strong> {ngo.criteria}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                          <div>Contact: {ngo.trustContact}</div>
                          <div>Turnaround: <strong>{ngo.turnaroundTime}</strong> • Officer: {ngo.verificationOfficer}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => onOpenCrowdfunding && onOpenCrowdfunding()}
                          className="btn btn-secondary btn-sm"
                        >
                          Emergency Crowdfund
                        </button>

                        <button
                          onClick={() => handleApplyGrant(ngo.id)}
                          disabled={isApplied}
                          className={isApplied ? 'btn btn-green btn-sm' : 'btn btn-purple btn-sm'}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 size={14} /> Application Submitted
                            </>
                          ) : (
                            <>
                              Apply for NGO Grant <ChevronRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 3: MY APPLICATIONS & SANCTION LETTERS */}
          {ngoSubTab === 'MY_APPLICATIONS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Active CSR Grant Applications & Disbursement Letters:
                </h4>
                <button
                  onClick={() => {
                    setSelectedCSRForModal(null);
                    setIsCSRModalOpen(true);
                  }}
                  className="btn btn-purple btn-sm"
                >
                  <Plus size={14} /> New CSR Request
                </button>
              </div>

              {csrApplications.map(app => (
                <div
                  key={app.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderLeft: '5px solid #10b981',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                          ✓ SANCTIONED & CREDITED
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Ref: <strong style={{ color: '#9333ea' }}>{app.referenceNo}</strong>
                        </span>
                      </div>
                      <h4 style={{ margin: '6px 0 2px', fontSize: '1.2rem', fontWeight: 800 }}>
                        {app.corporateName}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Procedure: <strong>{app.treatmentName}</strong> at <strong>{app.hospitalName}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sanctioned CSR Amount</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                        ₹{app.sanctionedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    background: 'var(--bg-secondary)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Patient Beneficiary:</span>
                      <div style={{ fontWeight: 600 }}>{app.patientName}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>ABHA Health ID:</span>
                      <div style={{ fontWeight: 600, color: 'var(--medical-blue)' }}>{app.patientAbha}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Disbursement UTR:</span>
                      <div style={{ fontWeight: 600, color: '#9333ea' }}>{app.utrNumber}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Hospital Billing Desk:</span>
                      <div style={{ fontWeight: 600, color: '#10b981' }}>Direct Account Credit</div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <strong>Corporate Review:</strong> {app.corporateReviewNotes}
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.74rem' }}>
                      Official Section 135 Sanction Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB 4: ZERO-GAP CO-FUNDING MATRIX */}
          {ngoSubTab === 'CO_FUNDING' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldCheck size={24} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                  Zero-Gap Medical Protection: Stacking PM-JAY & Corporate CSR
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                High-end super-specialty treatments (e.g. Bone Marrow Transplants, Chemotherapy, Pediatric Cardiac Surgeries) often cost ₹8–₹15 Lakhs, exceeding PM-JAY’s ₹5 Lakh ceiling. CHIKITSA-X automatically stacks PM-JAY with Section 135 Corporate CSR funds to achieve 100% cashless coverage.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case Study 1: Pediatric Heart Repair</div>
                  <h4 style={{ margin: '6px 0 10px', fontSize: '1.1rem' }}>Congenital Heart Defect (VSD)</h4>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                    <div>• Total Hospital Cost: <strong>₹3,20,000</strong></div>
                    <div>• PM-JAY Package Cover: <strong style={{ color: 'var(--medical-blue)' }}>₹2,00,000</strong></div>
                    <div>• Reliance Mission Amrit CSR: <strong style={{ color: '#9333ea' }}>₹1,20,000</strong></div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px', fontWeight: 800, color: '#10b981' }}>
                      = Patient Out-Of-Pocket: ₹0 (100% Cashless)
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case Study 2: Oncology Chemotherapy</div>
                  <h4 style={{ margin: '6px 0 10px', fontSize: '1.1rem' }}>Acute Myeloid Leukemia (AML)</h4>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                    <div>• Total Protocol Cost: <strong>₹8,50,000</strong></div>
                    <div>• Ayushman Bharat PM-JAY: <strong style={{ color: 'var(--medical-blue)' }}>₹5,00,000</strong></div>
                    <div>• Tata Trusts Oncology Grant: <strong style={{ color: '#9333ea' }}>₹3,50,000</strong></div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px', fontWeight: 800, color: '#10b981' }}>
                      = Patient Out-Of-Pocket: ₹0 (100% Cashless)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CSR Application Modal */}
          {isCSRModalOpen && (
            <CSRApplicationModal
              language={language}
              selectedProgram={selectedCSRForModal}
              onClose={() => setIsCSRModalOpen(false)}
              onSuccess={() => {
                setIsCSRModalOpen(false);
                setNgoSubTab('MY_APPLICATIONS');
              }}
            />
          )}
        </div>
      )}

      {/* TAB 4: MULTI-SCHEME STACKING & 0% EMI */}
      {activeTab === 'STACKING' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Bill Stacking Engine */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} style={{ color: 'var(--medical-blue)' }} />
              Multi-Layer Cashless Bill Stacking
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Total Hospital Bill Estimate:
              </label>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{procedureCost.toLocaleString()}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Angioplasty (₹1.85L)', val: 185000 },
                  { label: 'Knee Surgery (₹2.4L)', val: 240000 },
                  { label: 'Appendectomy (₹65k)', val: 65000 },
                  { label: 'Cancer Chemotherapy (₹3.2L)', val: 320000 }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setProcedureCost(item.val)}
                    className={procedureCost === item.val ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasPMJAY} onChange={e => setHasPMJAY(e.target.checked)} />
                Layer 1: Ayushman Bharat PM-JAY (₹5 Lakhs Cover)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasStateScheme} onChange={e => setHasStateScheme(e.target.checked)} />
                Layer 2: State Health Scheme (MJPJAY / CMCHIS)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasPrivateInsurance} onChange={e => setHasPrivateInsurance(e.target.checked)} />
                Layer 3: Private Health Insurance TPA Claim
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasNGOAid} onChange={e => setHasNGOAid(e.target.checked)} />
                Layer 4: Tata / Rotary NGO Trust Humanitarian Grant
              </label>
            </div>

            {/* Visual Breakdown Bar */}
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span>Subsidized & Covered:</span>
                <strong style={{ color: 'var(--accent-green)' }}>₹{totalSubsidized.toLocaleString()} (100% Cashless)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Remaining Patient Gap:</span>
                <strong style={{ color: assessment.netFinancialGap > 0 ? 'var(--critical-red)' : 'var(--accent-green)' }}>
                  ₹{assessment.netFinancialGap.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* 0% Interest Medical EMI */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} style={{ color: '#9333ea' }} />
              Zero-Interest Medical EMI Plans
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Convert any remaining gap amount into convenient 0% interest monthly installments with instant paperless Aadhaar e-KYC.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[3, 6, 12, 24].map(months => {
                const monthly = Math.round(procedureCost / months);
                return (
                  <div
                    key={months}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{months} Months Tenure</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                      ₹{monthly.toLocaleString()}<span style={{ fontSize: '0.75rem' }}>/mo</span>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      0% Interest
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onOpenEMI && onOpenEMI(assessment.netFinancialGap || 50000)}
                className="btn btn-purple"
                style={{ flex: 1 }}
              >
                Apply for 0% Medical Loan <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
