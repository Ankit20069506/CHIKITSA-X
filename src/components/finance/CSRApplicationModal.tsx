import React, { useState } from 'react';
import type { AppLanguage, CSRCareProgram, CSRApplication } from '../../types';
import { db } from '../../db/database';
import {
  X,
  Building2,
  HeartHandshake,
  CheckCircle2,
  FileText,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  selectedProgram?: CSRCareProgram | null;
  onClose: () => void;
  onSuccess: (app: CSRApplication) => void;
}

export const CSRApplicationModal: React.FC<Props> = ({
  language,
  selectedProgram,
  onClose,
  onSuccess
}) => {
  const activePatient = db.getABHAProfile();
  const csrPrograms = db.getCSRPrograms();
  const hospitals = db.getHospitals();

  const [corporateId, setCorporateId] = useState<string>(
    selectedProgram?.id || csrPrograms[0].id
  );
  const [hospitalName, setHospitalName] = useState<string>(
    hospitals[0]?.name || 'Sassoon General Hospital & B.J. Medical College, Pune'
  );
  const [treatmentName, setTreatmentName] = useState<string>(
    'Pediatric Ventricular Septal Defect (VSD) Closure'
  );
  const [totalHospitalBill, setTotalHospitalBill] = useState<number>(320000);
  const [pmjayOrInsuranceCover, setPmjayOrInsuranceCover] = useState<number>(200000);
  const [patientAnnualIncome, setPatientAnnualIncome] = useState<number>(120000);
  const [rationCardType, setRationCardType] = useState<string>('BPL_YELLOW');
  const [hasIncomeCertificate, setHasIncomeCertificate] = useState<boolean>(true);
  const [hasDoctorEstimation, setHasDoctorEstimation] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sanctionedApp, setSanctionedApp] = useState<CSRApplication | null>(null);

  const activeCorporate = csrPrograms.find(c => c.id === corporateId) || csrPrograms[0];
  const netFinancialGap = Math.max(0, totalHospitalBill - pmjayOrInsuranceCover);
  const requestedCSRAmount = Math.min(netFinancialGap, activeCorporate.maxGrantPerPatient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const app = db.submitCSRApplication({
        patientName: activePatient.fullName,
        patientAbha: activePatient.abhaNumber,
        corporateId: activeCorporate.id,
        corporateName: activeCorporate.corporateName,
        treatmentName,
        hospitalName,
        totalHospitalBill,
        pmjayOrInsuranceCover,
        requestedCSRAmount
      });

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSanctionedApp(app);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={24} color="#9333ea" />
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
                {language === 'HI' ? 'कॉर्पोरेट सीएसआर मेडिकल सहायता आवेदन' : 'Corporate CSR Medical Sponsorship Application'}
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {language === 'HI'
                ? 'कंपनी अधिनियम धारा 135 के तहत कॉर्पोरेट स्वास्थ्य फंड व अस्पताल प्रत्यक्ष क्रेडिट'
                : 'Section 135 Companies Act Corporate Health Corpus with Direct Hospital Billing Disbursement'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', flex: 1 }}>
          {!sanctionedApp ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Highlight Banner */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(147, 51, 234, 0.08)',
                border: '1px solid rgba(147, 51, 234, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Sparkles size={22} color="#9333ea" />
                <div style={{ fontSize: '0.84rem' }}>
                  <strong>{language === 'HI' ? '100% कैशलेस डायरेक्ट अस्पताल क्रेडिट:' : '100% Cashless Direct Hospital Credit:'}</strong>{' '}
                  {language === 'HI'
                    ? 'स्वीकृत सीएसआर राशि सीधे अस्पताल बिलिंग डेस्क को हस्तांतरित होगी, जिससे रोगी पर शून्य वित्तीय भार आएगा।'
                    : 'Approved CSR grants are transferred directly to the hospital billing desk, preventing out-of-pocket distress.'}
                </div>
              </div>

              {/* Patient ABHA summary */}
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.86rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Beneficiary: </span>
                  <strong>{activePatient.fullName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>ABHA ID: </span>
                  <strong style={{ color: 'var(--medical-blue)' }}>{activePatient.abhaNumber}</strong>
                </div>
                <div>
                  <span className="badge badge-green">KYC Verified</span>
                </div>
              </div>

              {/* Select Corporate CSR Fund */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  {language === 'HI' ? 'कॉर्पोरेट सीएसआर स्वास्थ्य फंड चुनें *' : 'Select Corporate CSR Health Fund *'}
                </label>
                <select
                  value={corporateId}
                  onChange={e => setCorporateId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {csrPrograms.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.corporateName} — Max ₹{p.maxGrantPerPatient.toLocaleString()} ({p.focusAreas[0]?.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Eligibility Criteria: {activeCorporate.criteria}
                </div>
              </div>

              {/* Hospital & Procedure */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    {language === 'HI' ? 'इलाज / सर्जरी का नाम *' : 'Treatment / Surgery Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={treatmentName}
                    onChange={e => setTreatmentName(e.target.value)}
                    placeholder="e.g. Chemotherapy, Valve Replacement"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    {language === 'HI' ? 'संबद्ध अस्पताल *' : 'Empanelled Hospital *'}
                  </label>
                  <select
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem'
                    }}
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Numbers */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  {language === 'HI' ? 'लागत विवरण व सीएसआर अनुदान आवश्यकता:' : 'Bill Estimate & Requested CSR Co-Funding:'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Total Hospital Bill (₹)
                    </label>
                    <input
                      type="number"
                      value={totalHospitalBill}
                      onChange={e => setTotalHospitalBill(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      PM-JAY / Insurance Cover (₹)
                    </label>
                    <input
                      type="number"
                      value={pmjayOrInsuranceCover}
                      onChange={e => setPmjayOrInsuranceCover(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Calculated Unmet Gap (₹)
                    </label>
                    <div style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--emergency-red)', fontSize: '0.95rem' }}>
                      ₹{netFinancialGap.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>
                    {language === 'HI' ? 'कॉर्पोरेट सीएसआर सहायता राशि:' : 'Requested Corporate CSR Grant:'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    ₹{requestedCSRAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Eligibility Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasIncomeCertificate}
                    onChange={e => setHasIncomeCertificate(e.target.checked)}
                    style={{ accentColor: '#9333ea', width: '16px', height: '16px' }}
                  />
                  <span>Income certificate (&lt; ₹3.5 Lakhs) or BPL / Antyodaya Ration Card attached</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasDoctorEstimation}
                    onChange={e => setHasDoctorEstimation(e.target.checked)}
                    style={{ accentColor: '#9333ea', width: '16px', height: '16px' }}
                  />
                  <span>Hospital Clinical Diagnosis and Treatment Cost Estimation Certificate attached</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  {language === 'HI' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasIncomeCertificate || !hasDoctorEstimation}
                  className="btn btn-purple"
                  style={{ minWidth: '220px' }}
                >
                  {isSubmitting ? (
                    <Clock size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {isSubmitting
                    ? (language === 'HI' ? 'सीएसआर स्वीकृति जारी...' : 'Sanctioning Grant...')
                    : (language === 'HI' ? 'सीएसआर अनुदान स्वीकृत करें' : 'Fast-Track Sanction Grant')}
                </button>
              </div>
            </form>
          ) : (
            /* Sanction Success View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <div>
                <span className="badge badge-green" style={{ marginBottom: '6px' }}>
                  ✓ CSR SECTION 135 FAST-TRACK APPROVED
                </span>
                <h3 style={{ margin: '6px 0 4px', fontSize: '1.4rem', fontWeight: 800 }}>
                  {language === 'HI' ? 'सीएसआर कॉर्पोरेट सहायता स्वीकृत!' : 'Corporate CSR Grant Sanctioned!'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  {sanctionedApp.corporateName} has approved direct billing payment for {sanctionedApp.patientName}.
                </p>
              </div>

              {/* Official Sanction Certificate Card */}
              <div style={{
                width: '100%',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Official CSR Sanction Reference
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9333ea', letterSpacing: '1px' }}>
                      {sanctionedApp.referenceNo}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Disbursed Grant</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{sanctionedApp.sanctionedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Treatment: </span>
                    <strong>{sanctionedApp.treatmentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Hospital: </span>
                    <strong>{sanctionedApp.hospitalName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Disbursement UTR: </span>
                    <strong style={{ color: 'var(--medical-blue)' }}>{sanctionedApp.utrNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>DIRECT HOSPITAL CREDIT</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(147, 51, 234, 0.08)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong>Corporate Review Notes:</strong> {sanctionedApp.corporateReviewNotes}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSuccess(sanctionedApp)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {language === 'HI' ? 'आवेदन व मंजूरी पत्र देखें' : 'View CSR Grants Ledger'}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
