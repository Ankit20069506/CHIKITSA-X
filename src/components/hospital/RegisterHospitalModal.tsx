import React, { useState } from 'react';
import type { AppLanguage, HospitalRegistrationForm, Hospital } from '../../types';
import { db } from '../../db/database';
import {
  Building2,
  X,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Droplet,
  FileText,
  Phone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  onClose: () => void;
  onRegistered: (newHosp: Hospital) => void;
}

export const RegisterHospitalModal: React.FC<Props> = ({
  language,
  onClose,
  onRegistered
}) => {
  const [formData, setFormData] = useState<HospitalRegistrationForm>({
    name: 'Fortis Escorts Super Specialty Institute',
    rohiniId: 'ROHINI-411001-9428',
    nabhLevel: 'FULL_NABH',
    licenseNumber: 'MH-MED-REG-2026-8812',
    type: 'PRIVATE_EMPANELLED',
    city: 'Pune',
    state: 'Maharashtra',
    contactNumber: '+91 20 7100 8000',
    emergency24x7: true,
    icuTotal: 40,
    ventilatorTotal: 22,
    oxygenBedsTotal: 85,
    generalBedsTotal: 220,
    bloodBankInHouse: true,
    bloodUnitsInitial: 120,
    acceptedGovSchemes: ['Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Tata Trusts Empanelled', 'CGHS'],
    opdDepartments: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 'Pediatrics'],
    nodalOfficerName: 'Dr. Sameer Deshmukh',
    nodalOfficerPhone: '+91 98230 44910'
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdHospital, setCreatedHospital] = useState<Hospital | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHospital = db.registerHospital(formData);
    setCreatedHospital(newHospital);
    setIsSubmitted(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onRegistered(newHospital);
  };

  const toggleScheme = (scheme: string) => {
    setFormData(prev => {
      const exists = prev.acceptedGovSchemes.includes(scheme);
      return {
        ...prev,
        acceptedGovSchemes: exists
          ? prev.acceptedGovSchemes.filter(s => s !== scheme)
          : [...prev.acceptedGovSchemes, scheme]
      };
    });
  };

  const toggleDept = (dept: string) => {
    setFormData(prev => {
      const exists = prev.opdDepartments.includes(dept);
      return {
        ...prev,
        opdDepartments: exists
          ? prev.opdDepartments.filter(d => d !== dept)
          : [...prev.opdDepartments, dept]
      };
    });
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
        maxWidth: '840px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #9333ea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                  {language === 'HI' ? 'अस्पताल ऑनबोर्डिंग व पंजीकरण पोर्टल' : 'Hospital ROHINI Registration & Onboarding'}
                </h3>
                <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>ABDM M1 Registry</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {language === 'HI'
                  ? 'रोहिणी आईडी, एनएबीएच मान्यता, आईसीयू बेड टेलीमेट्री व पीएम-जेएवाई संबद्धता दर्ज करें'
                  : 'Register hospital facility with ROHINI ID, NABH accreditation, ICU telemetry & PM-JAY integration'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Basic Identity */}
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 12px', color: 'var(--medical-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} /> 1. Hospital Identity & Accreditation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Hospital / Institute Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      ROHINI Registry ID (Insurance Registry):
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rohiniId}
                      onChange={e => setFormData({ ...formData, rohiniId: e.target.value })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      NABH / NABL Accreditation:
                    </label>
                    <select
                      value={formData.nabhLevel}
                      onChange={e => setFormData({ ...formData, nabhLevel: e.target.value as any })}
                      className="input"
                      style={{ width: '100%' }}
                    >
                      <option value="FULL_NABH">Full NABH Accredited (Apex Standard)</option>
                      <option value="ENTRY_LEVEL">NABH Entry Level Pre-Accreditation</option>
                      <option value="NABL_ACCREDITED">NABL Diagnostic Lab Accredited</option>
                      <option value="STATE_CERTIFIED">State Directorate Certified</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Facility Type:
                    </label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      className="input"
                      style={{ width: '100%' }}
                    >
                      <option value="PRIVATE_EMPANELLED">Private Empaneled Tertiary Center</option>
                      <option value="GOVERNMENT">Government Medical College / AIIMS</option>
                      <option value="CHARITABLE_TRUST">Charitable Trust / NGO Hospital</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      City & State:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="input"
                        placeholder="City"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="input"
                        placeholder="State"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Emergency 24x7 Helpline:
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Critical Bed Telemetry */}
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 12px', color: 'var(--medical-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} /> 2. Bed Telemetry & Trauma ICU Capacity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Total General Beds:
                    </label>
                    <input
                      type="number"
                      value={formData.generalBedsTotal}
                      onChange={e => setFormData({ ...formData, generalBedsTotal: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      ICU Beds Capacity:
                    </label>
                    <input
                      type="number"
                      value={formData.icuTotal}
                      onChange={e => setFormData({ ...formData, icuTotal: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Invasive Ventilators:
                    </label>
                    <input
                      type="number"
                      value={formData.ventilatorTotal}
                      onChange={e => setFormData({ ...formData, ventilatorTotal: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Piped Oxygen Beds:
                    </label>
                    <input
                      type="number"
                      value={formData.oxygenBedsTotal}
                      onChange={e => setFormData({ ...formData, oxygenBedsTotal: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Blood Bank & Ancillary */}
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 12px', color: 'var(--medical-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplet size={16} /> 3. Blood Bank & Diagnostics Facility
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.bloodBankInHouse}
                      onChange={e => setFormData({ ...formData, bloodBankInHouse: e.target.checked })}
                    />
                    Licensed In-House 24x7 Blood Bank Available
                  </label>

                  {formData.bloodBankInHouse && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Initial Units Stock:</span>
                      <input
                        type="number"
                        value={formData.bloodUnitsInitial}
                        onChange={e => setFormData({ ...formData, bloodUnitsInitial: Number(e.target.value) })}
                        className="input"
                        style={{ width: '90px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Government Empanelments */}
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: 'var(--medical-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> 4. Government Health Schemes Empanelment
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {[
                    'Ayushman Bharat PM-JAY',
                    'MJPJAY Maharashtra',
                    'CGHS Central Government',
                    'ECHS Ex-Servicemen',
                    'Tata Trusts Empanelled'
                  ].map(scheme => {
                    const active = formData.acceptedGovSchemes.includes(scheme);
                    return (
                      <button
                        key={scheme}
                        type="button"
                        onClick={() => toggleScheme(scheme)}
                        className={active ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {active && <CheckCircle2 size={13} style={{ marginRight: '4px' }} />}
                        {scheme}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: OPD Departments */}
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: 'var(--medical-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> 5. Active OPD Specialty Departments
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    'Cardiology',
                    'Oncology',
                    'Orthopedics',
                    'General Medicine',
                    'Neurology',
                    'Pediatrics',
                    'Gastroenterology',
                    'Pulmonology'
                  ].map(dept => {
                    const active = formData.opdDepartments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDept(dept)}
                        className={active ? 'btn btn-purple btn-sm' : 'btn btn-secondary btn-sm'}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {active && <CheckCircle2 size={13} style={{ marginRight: '4px' }} />}
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Register Hospital Facility <ChevronRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                Hospital Successfully Registered & Empaneled!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                {createdHospital?.name} is now connected to the Master Database and live in the CHIKITSA-X Hospital Finder & Bed Telemetry HUD.
              </p>

              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                maxWidth: '480px',
                margin: '0 auto 24px',
                textAlign: 'left',
                fontSize: '0.85rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div><strong>Assigned Hospital ID:</strong> {createdHospital?.id}</div>
                <div><strong>ROHINI ID:</strong> {formData.rohiniId}</div>
                <div><strong>Accreditation:</strong> {formData.nabhLevel}</div>
                <div><strong>Active Telemetry:</strong> {formData.generalBedsTotal} Beds • {formData.icuTotal} ICU • {formData.ventilatorTotal} Ventilators</div>
              </div>

              <button onClick={onClose} className="btn btn-primary">
                Done & Return to Hospital Command Center
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
