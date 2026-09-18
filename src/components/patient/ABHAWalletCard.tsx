import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { ABHAProfile, FHIRRecord, AppLanguage } from '../../types';
import { Download, FileCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  profile: ABHAProfile;
  fhirRecords: FHIRRecord[];
  language: AppLanguage;
}

export const ABHAWalletCard: React.FC<Props> = ({ profile, fhirRecords, language }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        `ABHA:${profile.abhaNumber}|NAME:${profile.fullName}|ADDR:${profile.abhaAddress}|DOB:${profile.dob}`,
        { width: 120, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } },
        (err) => {
          if (err) console.error('QR Render Error:', err);
        }
      );
    }
  }, [profile]);

  const handleDownloadFHIR = () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      id: `bundle-${Date.now()}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
      },
      identifier: {
        system: 'https://healthid.ndhm.gov.in',
        value: profile.abhaNumber
      },
      entry: fhirRecords.map(rec => ({
        fullUrl: rec.rawJsonUrl,
        resource: {
          resourceType: rec.resourceType,
          id: rec.id,
          date: rec.date,
          performer: rec.doctor,
          institution: rec.facility,
          title: rec.title,
          status: 'final',
          note: [{ text: rec.summary }]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABDM_FHIR_R4_${profile.abhaAddress}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>🇮🇳</span>
            {language === 'HI' ? 'आयुष्मान भारत आभा (ABHA) 2.0 हेल्थ वॉलेट' : 'Ayushman Bharat ABHA 2.0 National Health Wallet'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            {language === 'HI' ? 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) एवं FHIR R4 मानक अनुरूप' : 'National Health Authority (NHA) & ABDM M1/M2/M3 FHIR R4 Compliant'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadFHIR} className="btn btn-primary btn-sm">
            <Download size={15} /> {language === 'HI' ? 'FHIR R4 रिकॉर्ड डाउनलोड करें' : 'Export FHIR R4 Bundle (.json)'}
          </button>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid rgba(249, 115, 22, 0.4)',
        padding: '24px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '20px'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #ff9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, letterSpacing: '0.08em', color: '#ffedd5', fontSize: '0.9rem' }}>
                NATIONAL HEALTH AUTHORITY
              </span>
              <span className="badge badge-green" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.7rem' }}>
                <CheckCircle2 size={11} /> KYC VERIFIED
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 6px', letterSpacing: '-0.01em', color: '#ffffff' }}>
              {profile.fullName}
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>DOB: <strong style={{ color: '#f8fafc' }}>{profile.dob}</strong></span>
              <span>Gender: <strong style={{ color: '#f8fafc' }}>{profile.gender}</strong></span>
              <span>Blood Group: <strong style={{ color: '#38bdf8' }}>{profile.bloodGroup}</strong></span>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <canvas ref={qrCanvasRef} style={{ width: '100px', height: '100px' }} />
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', letterSpacing: '0.05em' }}>
              ABHA NUMBER (14-DIGIT UNIQUE HEALTH ID)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f8fafc' }}>
              {profile.abhaNumber}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', letterSpacing: '0.05em' }}>
              ABHA ADDRESS
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff9933' }}>
              {profile.abhaAddress}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} color="var(--medical-teal)" />
          {language === 'HI' ? 'लिंक्ड डिजिटल हेल्थ रिकॉर्ड्स (FHIR R4 Resources)' : 'Linked Electronic Health Records (EHR / ABDM)'}
        </h4>

        {fhirRecords.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            📋 {language === 'HI'
              ? 'वर्तमान में कोई लिंक्ड ईएचआर (EHR) रिकॉर्ड उपलब्ध नहीं है। अस्पताल परामर्श अथवा डिस्चार्ज उपरांत नए नैदानिक रिकॉर्ड यहाँ प्रदर्शित होंगे।'
              : 'No clinical health records linked yet. Verified hospital discharge summaries and lab reports will appear here.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {fhirRecords.map(rec => (
              <div
                key={rec.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{rec.resourceType}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                  {rec.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {rec.facility} • {rec.doctor}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {rec.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
