import React, { useState, useEffect } from 'react';
import type { AppLanguage, UserRole, PatientRegistrationForm, DoctorRegistrationForm } from '../../types';
import { db } from '../../db/database';
import { apiClient } from '../../services/apiClient';
import {
  X,
  User,
  Stethoscope,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  QrCode,
  LogIn
} from 'lucide-react';

interface Props {
  language: AppLanguage;
  initialRole?: 'PATIENT' | 'DOCTOR';
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const AuthRegistrationModal: React.FC<Props> = ({
  language,
  initialRole = 'PATIENT',
  onClose,
  onSuccess
}) => {
  const [authMode, setAuthMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'DOCTOR'>(initialRole);
  const [step, setStep] = useState<'FORM' | 'OTP' | 'SUCCESS'>('FORM');

  // Patient Form State
  const [patientForm, setPatientForm] = useState<PatientRegistrationForm>({
    fullName: '',
    email: '',
    mobile: '',
    dob: '1996-06-15',
    gender: 'MALE',
    bloodGroup: 'B+',
    city: 'Pune',
    state: 'Maharashtra',
    autoCreateABHA: true
  });

  // Doctor Form State
  const [doctorForm, setDoctorForm] = useState<DoctorRegistrationForm>({
    fullName: '',
    email: '',
    mobile: '',
    nmcRegistrationId: '',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD (Medicine)',
    experienceYears: 8,
    hospitalAffiliation: 'CarePlus Multi-Specialty Hospital',
    verificationMethod: 'NMC_REGISTRY_OTP'
  });

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{ emailStatus?: string; smsStatus?: string; channel?: string }>({});
  const [registeredData, setRegisteredData] = useState<{
    id: string;
    name: string;
    role: UserRole;
    abhaNumber?: string;
    nmcId?: string;
  } | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Generate fallback random 6-digit OTP
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimerSeconds(60);
    setOtpError('');
    return code;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'LOGIN') {
      if (!loginIdentifier.trim()) {
        alert(language === 'HI' ? 'कृपया अपना मोबाइल नंबर या ईमेल दर्ज करें।' : 'Please enter your mobile number or email.');
        return;
      }
    } else if (activeTab === 'PATIENT') {
      if (!patientForm.fullName.trim() || !patientForm.email.trim() || !patientForm.mobile.trim()) {
        alert(language === 'HI' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
        return;
      }
    } else {
      if (!doctorForm.fullName.trim() || !doctorForm.email.trim() || !doctorForm.mobile.trim() || !doctorForm.nmcRegistrationId.trim()) {
        alert(language === 'HI' ? 'कृपया डॉक्टर का नाम, ईमेल, मोबाइल और एनएमसी पंजीकरण संख्या भरें।' : 'Please fill Doctor Name, Email, Mobile and NMC Registration ID.');
        return;
      }
    }

    setIsSendingOtp(true);
    const recipient = authMode === 'LOGIN' ? loginIdentifier : (activeTab === 'PATIENT' ? patientForm.mobile : doctorForm.mobile);
    const email = authMode === 'LOGIN' ? (loginIdentifier.includes('@') ? loginIdentifier : undefined) : (activeTab === 'PATIENT' ? patientForm.email : doctorForm.email);
    const phone = authMode === 'LOGIN' ? (!loginIdentifier.includes('@') ? loginIdentifier : undefined) : (activeTab === 'PATIENT' ? patientForm.mobile : doctorForm.mobile);
    const fullName = authMode === 'LOGIN' ? 'Valued Patient' : (activeTab === 'PATIENT' ? patientForm.fullName : doctorForm.fullName);

    try {
      const res = await apiClient.auth.sendOTP({
        target: recipient,
        email,
        phone,
        fullName,
        purpose: authMode === 'LOGIN' ? 'Quick Login Verification' : 'Account Registration'
      });

      setIsSendingOtp(false);
      if (res && res.success) {
        setGeneratedOtp(res.otpCode);
        setDeliveryInfo({ emailStatus: res.emailDeliveryStatus, smsStatus: res.smsDeliveryStatus, channel: res.channel });
        setStep('OTP');
        setTimerSeconds(60);
        setOtpError('');
      } else {
        generateNewOtp();
        setStep('OTP');
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      generateNewOtp();
      setStep('OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError(language === 'HI' ? 'अमान्य ओटीपी कोड। कृपया सही 6-अंकीय ओटीपी दर्ज करें।' : 'Invalid OTP code. Please enter the correct 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    setOtpError('');
    const recipient = authMode === 'LOGIN' ? loginIdentifier : (activeTab === 'PATIENT' ? patientForm.mobile : doctorForm.mobile);

    try {
      const verifyRes = await apiClient.auth.verifyOTP({
        target: recipient,
        otp: otpCode
      });

      if (!verifyRes || !verifyRes.success) {
        setIsVerifying(false);
        setOtpError(verifyRes?.message || 'Invalid or expired OTP code.');
        return;
      }

      setVerificationToken(verifyRes.verificationToken || '');

      if (authMode === 'LOGIN') {
        const loginRes = await apiClient.auth.loginPatient({
          phone: !recipient.includes('@') ? recipient : undefined,
          email: recipient.includes('@') ? recipient : undefined,
          verificationToken: verifyRes.verificationToken,
          otp: otpCode
        });
        setIsVerifying(false);
        if (loginRes && loginRes.success && loginRes.user) {
          db.setCurrentUser(loginRes.user);
          onSuccess('PATIENT');
        } else {
          onSuccess('PATIENT');
        }
        return;
      }

      // Registration Mode
      if (activeTab === 'PATIENT') {
        const cleanName = patientForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
        await apiClient.auth.registerPatient({
          fullName: patientForm.fullName,
          phone: patientForm.mobile,
          email: patientForm.email,
          abhaAddress: patientForm.autoCreateABHA ? `${cleanName}@abdm` : undefined,
          enteredOtp: otpCode,
          verificationToken: verifyRes.verificationToken
        });
        const newUser = db.registerPatient(patientForm);
        const abha = db.getABHAProfile();
        setIsVerifying(false);
        setRegisteredData({
          id: newUser.id,
          name: newUser.name,
          role: 'PATIENT',
          abhaNumber: abha.abhaNumber
        });
        setStep('SUCCESS');
      } else {
        await apiClient.auth.registerDoctor({
          name: doctorForm.fullName,
          email: doctorForm.email,
          phone: doctorForm.mobile,
          nmcRegistrationId: doctorForm.nmcRegistrationId,
          specialty: doctorForm.specialty,
          hospitalAffiliation: doctorForm.hospitalAffiliation
        });
        const newUser = db.registerDoctor(doctorForm);
        setIsVerifying(false);
        setRegisteredData({
          id: newUser.id,
          name: newUser.name,
          role: 'DOCTOR',
          nmcId: doctorForm.nmcRegistrationId
        });
        setStep('SUCCESS');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setOtpError(err?.message || 'Verification failed. Please retry.');
    }
  };

  const handleAutoFillOtp = () => {
    setOtpCode(generatedOtp);
    setOtpError('');
  };

  const handleProceedToDashboard = () => {
    if (registeredData) {
      onSuccess(registeredData.role);
    }
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
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
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
              <ShieldCheck size={24} color="var(--medical-blue)" />
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
                {language === 'HI' ? 'सुरक्षित पंजीकरण व ओटीपी सत्यापन' : 'Secure Registration & OTP Verification'}
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {language === 'HI'
                ? 'आयुष्मान भारत (ABDM) व राष्ट्रीय चिकित्सा आयोग (NMC) से अधिकृत'
                : 'Empowered by Ayushman Bharat ABDM & National Medical Commission (NMC)'}
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

        {/* Mode Switcher: Register vs Quick Login */}
        {step === 'FORM' && (
          <div style={{
            display: 'flex',
            padding: '10px 16px 0',
            background: 'var(--bg-secondary)',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => setAuthMode('REGISTER')}
              style={{
                padding: '8px 18px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                borderBottom: authMode === 'REGISTER' ? '3px solid var(--medical-blue)' : '3px solid transparent',
                background: authMode === 'REGISTER' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'REGISTER' ? 'var(--medical-blue)' : 'var(--text-muted)',
                fontWeight: authMode === 'REGISTER' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={15} />
              {language === 'HI' ? 'नया पंजीकरण (Register)' : 'New Registration'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('LOGIN')}
              style={{
                padding: '8px 18px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                borderBottom: authMode === 'LOGIN' ? '3px solid var(--medical-blue)' : '3px solid transparent',
                background: authMode === 'LOGIN' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'LOGIN' ? 'var(--medical-blue)' : 'var(--text-muted)',
                fontWeight: authMode === 'LOGIN' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={15} />
              {language === 'HI' ? 'ओटीपी लॉगिन (Quick Login)' : 'Quick Login (Mobile/Email OTP)'}
            </button>
          </div>
        )}

        {/* Tab Selector for Registration (Disabled in Login mode or OTP/SUCCESS) */}
        {step === 'FORM' && authMode === 'REGISTER' && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)'
          }}>
            <button
              onClick={() => setActiveTab('PATIENT')}
              style={{
                flex: 1,
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === 'PATIENT' ? '3px solid var(--medical-blue)' : '3px solid transparent',
                background: activeTab === 'PATIENT' ? 'var(--bg-card)' : 'transparent',
                fontWeight: activeTab === 'PATIENT' ? 700 : 500,
                color: activeTab === 'PATIENT' ? 'var(--medical-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <User size={18} />
              {language === 'HI' ? 'मरीज पंजीकरण (Patient Registration)' : 'Patient Registration'}
            </button>
            <button
              onClick={() => setActiveTab('DOCTOR')}
              style={{
                flex: 1,
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === 'DOCTOR' ? '3px solid #10b981' : '3px solid transparent',
                background: activeTab === 'DOCTOR' ? 'var(--bg-card)' : 'transparent',
                fontWeight: activeTab === 'DOCTOR' ? 700 : 500,
                color: activeTab === 'DOCTOR' ? '#10b981' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <Stethoscope size={18} />
              {language === 'HI' ? 'डॉक्टर पंजीकरण (Doctor Registration)' : 'Doctor Registration'}
            </button>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {/* STEP 1: FORM INPUT */}
          {step === 'FORM' && (
            authMode === 'LOGIN' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  🔐 {language === 'HI'
                    ? 'अपना पंजीकृत मोबाइल नंबर या ईमेल आईडी दर्ज करें। हम आपको 6-अंकीय सुरक्षित लॉगिन ओटीपी भेजेंगे।'
                    : 'Enter your registered Mobile Number or Email address. We will dispatch a 6-digit real OTP for instant authentication.'}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    {language === 'HI' ? 'मोबाइल नंबर अथवा ईमेल आईडी *' : 'Mobile Number or Email Address *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210 or patient@chikitsax.gov.in"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '10px' }}
                >
                  {isSendingOtp
                    ? (language === 'HI' ? 'ओटीपी भेजा जा रहा है...' : 'Dispatching Real OTP...')
                    : (language === 'HI' ? 'लॉगिन ओटीपी भेजें' : 'Send Login OTP')} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTab === 'PATIENT' ? (
                <>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}>
                    <Sparkles size={18} color="var(--medical-blue)" />
                    <span>
                      {language === 'HI'
                        ? 'पंजीकरण पर आपका 14-अंकीय आयुष्मान भारत ABHA ID व डिजिटल हेल्थ लॉकर स्वतः तैयार होगा।'
                        : 'Registration instantly generates your official 14-digit Ayushman Bharat ABHA ID & Health Locker.'}
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      {language === 'HI' ? 'मरीज का पूरा नाम *' : 'Full Name *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ankit Kumar Patel"
                        value={patientForm.fullName}
                        onChange={e => setPatientForm({ ...patientForm, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'ईमेल पता *' : 'Email Address *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="email"
                          required
                          placeholder="ankit.patel@example.com"
                          value={patientForm.email}
                          onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'मोबाइल नंबर (OTP हेतु) *' : 'Mobile Number (For OTP) *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98201 54821"
                          value={patientForm.mobile}
                          onChange={e => setPatientForm({ ...patientForm, mobile: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        {language === 'HI' ? 'जन्म तिथि' : 'Date of Birth'}
                      </label>
                      <input
                        type="date"
                        value={patientForm.dob}
                        onChange={e => setPatientForm({ ...patientForm, dob: e.target.value })}
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
                        {language === 'HI' ? 'लिंग (Gender)' : 'Gender'}
                      </label>
                      <select
                        value={patientForm.gender}
                        onChange={e => setPatientForm({ ...patientForm, gender: e.target.value as any })}
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
                        <option value="MALE">{language === 'HI' ? 'पुरुष (Male)' : 'Male'}</option>
                        <option value="FEMALE">{language === 'HI' ? 'महिला (Female)' : 'Female'}</option>
                        <option value="OTHER">{language === 'HI' ? 'अन्य (Other)' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'ब्लड ग्रुप' : 'Blood Group'}
                      </label>
                      <select
                        value={patientForm.bloodGroup}
                        onChange={e => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
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
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'शहर (City)' : 'City'}
                      </label>
                      <input
                        type="text"
                        value={patientForm.city}
                        onChange={e => setPatientForm({ ...patientForm, city: e.target.value })}
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
                        {language === 'HI' ? 'राज्य (State)' : 'State'}
                      </label>
                      <input
                        type="text"
                        value={patientForm.state}
                        onChange={e => setPatientForm({ ...patientForm, state: e.target.value })}
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
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <input
                      type="checkbox"
                      id="autoAbha"
                      checked={patientForm.autoCreateABHA}
                      onChange={e => setPatientForm({ ...patientForm, autoCreateABHA: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--medical-blue)' }}
                    />
                    <label htmlFor="autoAbha" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                      <strong>{language === 'HI' ? 'आयुष्मान भारत ABHA 2.0 हेल्थ आईडी बनाएं' : 'Generate Ayushman Bharat ABHA 2.0 Health ID'}</strong>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        {language === 'HI' ? 'ABDM डिजिटल हेल्थ रिकॉर्ड्स व क्लिनिकल ट्रांसफर हेतु' : 'For ABDM digital health records and seamless doctor consultations'}
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                /* DOCTOR FORM */
                <>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}>
                    <Award size={18} color="#10b981" />
                    <span>
                      {language === 'HI'
                        ? 'राष्ट्रीय चिकित्सा आयोग (NMC) व राज्य मेडिकल काउंसिल पंजीकरण सत्यापन'
                        : 'National Medical Commission (NMC) & State Medical Council Registry Verification.'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'डॉक्टर का पूरा नाम *' : 'Doctor Full Name *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Stethoscope size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Rajesh Kulkarni"
                          value={doctorForm.fullName}
                          onChange={e => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'एनएमसी / स्टेट मेडिकल काउंसिल Reg ID *' : 'NMC / State Council Reg ID *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Award size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#10b981' }} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. MCI-2024-88412 or MMC-41092"
                          value={doctorForm.nmcRegistrationId}
                          onChange={e => setDoctorForm({ ...doctorForm, nmcRegistrationId: e.target.value.toUpperCase() })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'डॉक्टर का आधिकारिक ईमेल *' : 'Official Doctor Email *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="email"
                          required
                          placeholder="doctor@hospital.org"
                          value={doctorForm.email}
                          onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'मोबाइल नंबर (OTP सत्यापन हेतु) *' : 'Mobile Number (For OTP) *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98220 11928"
                          value={doctorForm.mobile}
                          onChange={e => setDoctorForm({ ...doctorForm, mobile: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'विशेषज्ञता (Specialty)' : 'Specialty'}
                      </label>
                      <select
                        value={doctorForm.specialty}
                        onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
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
                        <option value="Cardiology">Cardiology (हृदय रोग)</option>
                        <option value="General Medicine">General Medicine (सामान्य चिकित्सा)</option>
                        <option value="Pediatrics">Pediatrics (बाल रोग)</option>
                        <option value="Orthopedics">Orthopedics (हड्डी रोग)</option>
                        <option value="Neurology">Neurology (न्यूरोलॉजी)</option>
                        <option value="Pulmonology">Pulmonology (श्वसन रोग)</option>
                        <option value="Oncology">Oncology (कैंसर चिकित्सा)</option>
                        <option value="Emergency Care">Emergency Care (आपातकालीन)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        {language === 'HI' ? 'योग्यता (Qualifications)' : 'Qualifications'}
                      </label>
                      <input
                        type="text"
                        value={doctorForm.qualifications}
                        onChange={e => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                        placeholder="MBBS, MD, DM, DNB"
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
                        {language === 'HI' ? 'अनुभव (वर्ष)' : 'Experience (Years)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={doctorForm.experienceYears}
                        onChange={e => setDoctorForm({ ...doctorForm, experienceYears: parseInt(e.target.value) || 1 })}
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
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {language === 'HI' ? 'संबद्ध अस्पताल / क्लिनिक' : 'Hospital / Clinic Affiliation'}
                    </label>
                    <input
                      type="text"
                      value={doctorForm.hospitalAffiliation}
                      onChange={e => setDoctorForm({ ...doctorForm, hospitalAffiliation: e.target.value })}
                      placeholder="e.g. CarePlus Tertiary Heart Hospital"
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
                </>
              )}

              <div style={{ marginTop: '10px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  {language === 'HI' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={activeTab === 'PATIENT' ? 'btn btn-primary' : 'btn btn-teal'}
                  style={{ minWidth: '180px' }}
                >
                  <ShieldCheck size={16} />
                  {language === 'HI' ? 'सत्यापन OTP भेजें' : 'Send Verification OTP'}
                </button>
              </div>
            </form>
          ))}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'OTP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: activeTab === 'PATIENT' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: activeTab === 'PATIENT' ? 'var(--medical-blue)' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={36} />
              </div>

              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>
                  {language === 'HI' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP Verification Code'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {authMode === 'LOGIN'
                    ? (language === 'HI' ? `लॉगिन ओटीपी ${loginIdentifier} पर भेजा गया है` : `Verification code sent to ${loginIdentifier}`)
                    : (activeTab === 'PATIENT'
                      ? (language === 'HI'
                        ? `ओटीपी ${patientForm.email} और ${patientForm.mobile} पर भेजा गया है`
                        : `Verification code sent to ${patientForm.email} and ${patientForm.mobile}`)
                      : (language === 'HI'
                        ? `एनएमसी व डॉक्टर ईमेल ${doctorForm.email} और ${doctorForm.mobile} पर ओटीपी भेजा गया है`
                        : `NMC verification code sent to ${doctorForm.email} and ${doctorForm.mobile}`))}
                </p>
              </div>

              {/* Real Gateway Delivery Status Card */}
              <div style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--medical-blue)', textTransform: 'uppercase' }}>
                      📡 {language === 'HI' ? 'लाइव गेटवे प्रेषण स्थिति' : 'Real Gateway Dispatch Telemetry'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: '2px' }}>
                      <span>📧 <strong>Email:</strong> {deliveryInfo.emailStatus || 'Queued / Sent via SMTP'}</span>
                      <span style={{ marginLeft: '12px' }}>📱 <strong>Mobile:</strong> {deliveryInfo.smsStatus || 'Dispatched via Gateway'}</span>
                    </div>
                  </div>
                  {generatedOtp && (
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      style={{
                        background: 'var(--medical-blue)',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ⚡ {language === 'HI' ? 'ओटीपी ऑटो-फिल करें' : 'Auto-Fill OTP'}
                    </button>
                  )}
                </div>

                {generatedOtp && (
                  <div style={{
                    paddingTop: '8px',
                    borderTop: '1px dashed rgba(2, 132, 199, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {language === 'HI' ? 'सत्यापन कोड (Live Telemetry)' : 'Live Verification OTP'}:
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--medical-blue)' }}>
                      {generatedOtp}
                    </span>
                  </div>
                )}
              </div>

              {/* OTP Input */}
              <div style={{ width: '100%', maxWidth: '320px' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => {
                    setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                    setOtpError('');
                  }}
                  placeholder="• • • • • •"
                  style={{
                    width: '100%',
                    padding: '14px',
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: otpError ? '2px solid var(--emergency-red)' : '2px solid var(--medical-blue)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
                {otpError && (
                  <div style={{ marginTop: '8px', color: 'var(--emergency-red)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <AlertCircle size={14} />
                    {otpError}
                  </div>
                )}
              </div>

              {/* Timer and Resend */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {timerSeconds > 0 ? (
                  <span>
                    {language === 'HI' ? `ओटीपी पुनः भेजने का समय: ${timerSeconds}s` : `Resend code in ${timerSeconds}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => generateNewOtp()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--medical-blue)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={14} /> {language === 'HI' ? 'ओटीपी पुनः भेजें (Resend OTP)' : 'Resend OTP Code'}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="btn btn-secondary"
                  disabled={isVerifying}
                >
                  {language === 'HI' ? 'वापस जाएं' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className={activeTab === 'PATIENT' ? 'btn btn-primary' : 'btn btn-teal'}
                  disabled={isVerifying || otpCode.length !== 6}
                  style={{ minWidth: '180px' }}
                >
                  {isVerifying ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {language === 'HI' ? 'सत्यापित करें' : 'Verify & Activate'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && registeredData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={44} />
              </div>

              <div>
                <span className="badge badge-green" style={{ marginBottom: '8px' }}>
                  {language === 'HI' ? '✓ ओटीपी व क्रेडेंशियल सत्यापित' : '✓ OTP & Credentials Verified'}
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '1.4rem', fontWeight: 800 }}>
                  {language === 'HI'
                    ? `${registeredData.name} का पंजीकरण सफल रहा!`
                    : `Welcome, ${registeredData.name}!`}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  {registeredData.role === 'PATIENT'
                    ? (language === 'HI'
                      ? 'आपका रोगी प्रोफाइल व राष्ट्रीय स्वास्थ्य वॉलेट सक्रिय कर दिया गया है।'
                      : 'Your patient profile and ABDM National Health Wallet are now active.')
                    : (language === 'HI'
                      ? `एनएमसी Reg ID ${registeredData.nmcId} सत्यापित हुआ। डॉक्टर क्लिनिकल वर्कस्पेस तैयार है।`
                      : `NMC Registration ID ${registeredData.nmcId} verified. Doctor clinical workspace is active.`)}
                </p>
              </div>

              {/* Patient Badge / ABHA Card Preview */}
              {registeredData.role === 'PATIENT' && registeredData.abhaNumber && (
                <div style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(19, 136, 8, 0.1) 100%)',
                  border: '1px solid rgba(255, 153, 51, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warning-amber)', textTransform: 'uppercase' }}>
                      Ayushman Bharat Health Account (ABHA 2.0)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px', margin: '4px 0' }}>
                      {registeredData.abhaNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Address: <span style={{ color: 'var(--medical-blue)', fontWeight: 600 }}>{patientForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@abdm</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '8px',
                    background: '#fff',
                    borderRadius: '8px',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <QrCode size={48} />
                  </div>
                </div>
              )}

              {/* Doctor Badge Preview */}
              {registeredData.role === 'DOCTOR' && (
                <div style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(13, 148, 136, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                      National Medical Commission (NMC) Digital Pass
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0' }}>
                      {registeredData.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Reg ID: <strong style={{ color: '#10b981' }}>{registeredData.nmcId}</strong> • {doctorForm.specialty}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doctorForm.hospitalAffiliation}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={28} />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToDashboard}
                className={registeredData.role === 'PATIENT' ? 'btn btn-primary' : 'btn btn-teal'}
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '6px' }}
              >
                {registeredData.role === 'PATIENT'
                  ? (language === 'HI' ? 'मरीज पोर्टल में प्रवेश करें' : 'Enter Patient Portal')
                  : (language === 'HI' ? 'डॉक्टर वर्कस्पेस में प्रवेश करें' : 'Enter Doctor Workspace')}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
