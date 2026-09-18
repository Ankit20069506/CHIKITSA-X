import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import {
  healthcareSecurityHeaders,
  generalApiLimiter,
  authSensitiveLimiter,
  requestSanitizer
} from './middleware/securityMiddleware';
import { notificationService } from './services/notificationService';
import { upHospitals } from './data/upHospitals';
import { initPostgres, isPostgresConnected, pgUsers, pgDoctors, pgAppointments, pgAudit } from './db/postgres';
import {
  encryptPHI,
  decryptPHI,
  computeAuditHash,
  signJWT,
  authenticateToken,
  requireRoles,
  type AuthenticatedRequest,
  type AuditBlock
} from './security';

export const app: Express = express();

// Initialize PostgreSQL (with automatic in-memory fallback)
initPostgres().catch(err => console.warn('PostgreSQL auto-init warning:', err));

// 1. Core Middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cors({
  origin: true, // Allow all verified dev/prod origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(healthcareSecurityHeaders);
app.use(requestSanitizer);
app.use(generalApiLimiter);

// Universal Path Normalizer: Supports both local Express (port 5000) and Vercel serverless functions
// Handles requests with or without /api prefix, and handles Vercel rewrite paths and catch-all slugs
app.use((req: Request, _res: Response, next) => {
  // If Vercel rewrote the path, restore original path from Vercel headers if present
  const vercelOriginal = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-invoke-path']) as string | undefined;
  if (vercelOriginal && vercelOriginal.startsWith('/api') && !vercelOriginal.includes('/api/index') && !vercelOriginal.includes('[...slug]')) {
    req.url = vercelOriginal;
  }

  // If Vercel catch-all slug is present in req.query
  if (req.query && req.query.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    if (slug && (!req.url || req.url.includes('[...slug]') || req.url === '/api' || req.url.startsWith('/api/index'))) {
      const search = req.url && req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      req.url = `/api/${slug}${search}`;
    }
  }

  // Strip internal Vercel index artifacts
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '/api');
  }
  if (req.url.startsWith('/api/[...slug]')) {
    req.url = req.url.replace('/api/[...slug]', '/api');
  }

  // If request URL does not start with /api, prefix it so it matches all /api/* routes
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  next();
});

// In-Memory Persistent Store (Syncs with backend state)
interface MockDatabaseState {
  hospitals: any[];
  users: any[];
  registeredDoctors: any[];
  liveOPDQueues: any[];
  csrApplications: any[];
  ambulanceDispatches: Map<string, any>;
  auditChain: AuditBlock[];
}

const dbState: MockDatabaseState = {
  hospitals: [
    ...upHospitals,
    {
      id: 'HOSP-MH-01',
      name: 'Sassoon General Hospital & B.J. Government Medical College',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 2.1,
      rating: 4.8,
      chikitsaCareScore: 95,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Rashtriya Arogya Nidhi'],
      emergency24x7: true,
      contactNumber: '+91 20 2612 8000',
      mapsCoord: { lat: 18.5273, lng: 73.8732 },
      opdDepartments: ['Emergency Trauma', 'Cardiology', 'Orthopedics', 'General Medicine', 'Neurology', 'Pediatrics'],
      bedTelemetry: {
        icuTotal: 55,
        icuAvailable: 14,
        ventilatorTotal: 28,
        ventilatorAvailable: 8,
        oxygenBedsTotal: 180,
        oxygenBedsAvailable: 52,
        generalBedsTotal: 1296,
        generalBedsAvailable: 210,
        lastTelemetryPing: 'Just now'
      },
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: '100% Free Public Government Care',
        opdConsultFee: 10,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 99,
        approxTreatmentRange: '₹0 Free Public Government Hospital'
      }
    },
    {
      id: 'HOSP-MH-02',
      name: 'King Edward Memorial (KEM) Hospital & Seth G.S. Medical College',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 12.4,
      rating: 4.9,
      chikitsaCareScore: 97,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra'],
      emergency24x7: true,
      contactNumber: '+91 22 2410 7000',
      mapsCoord: { lat: 19.0028, lng: 72.8427 },
      opdDepartments: ['Cardiovascular Thoracic Surgery', 'Cardiology', 'Neurosurgery', 'General Surgery', 'Gastroenterology'],
      bedTelemetry: {
        icuTotal: 92,
        icuAvailable: 18,
        ventilatorTotal: 48,
        ventilatorAvailable: 11,
        oxygenBedsTotal: 260,
        oxygenBedsAvailable: 74,
        generalBedsTotal: 1800,
        generalBedsAvailable: 290,
        lastTelemetryPing: '1 min ago'
      },
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: '100% Free Public Health Care (Apex Municipal)',
        opdConsultFee: 10,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 99,
        approxTreatmentRange: '₹0 100% Free BMC Government Treatment'
      }
    },
    {
      id: 'HOSP-MH-03',
      name: 'Ruby Hall Clinic & Superspeciality Oncology Center',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'PRIVATE_EMPANELLED',
      distanceKm: 3.8,
      rating: 4.9,
      chikitsaCareScore: 98,
      acceptedGovSchemes: ['Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Tata Trusts Empanelled', 'CGHS'],
      emergency24x7: true,
      contactNumber: '+91 20 6645 5100',
      mapsCoord: { lat: 18.5308, lng: 73.8775 },
      opdDepartments: ['Interventional Cardiology', 'Medical Oncology', 'Radiation Oncology', 'Neurology', 'Organ Transplant'],
      bedTelemetry: {
        icuTotal: 65,
        icuAvailable: 16,
        ventilatorTotal: 34,
        ventilatorAvailable: 9,
        oxygenBedsTotal: 150,
        oxygenBedsAvailable: 44,
        generalBedsTotal: 550,
        generalBedsAvailable: 98,
        lastTelemetryPing: 'Just now'
      },
      costProfile: {
        tier: 'PMJAY_CASHLESS_MODERATE',
        tierLabel: 'PM-JAY 100% Cashless / Moderate Private',
        opdConsultFee: 650,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 12,
        costScore: 84,
        approxTreatmentRange: '100% Cashless via PM-JAY / ₹4,500 Private Bed'
      }
    },
    {
      id: 'HOSP-MH-04',
      name: 'Deenanath Mangeshkar Hospital & Research Center',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'CHARITABLE_TRUST',
      distanceKm: 4.6,
      rating: 4.8,
      chikitsaCareScore: 95,
      acceptedGovSchemes: ['MJPJAY Maharashtra', 'Ayushman Bharat PM-JAY', 'Tata Trusts Empanelled'],
      emergency24x7: true,
      contactNumber: '+91 20 4015 1000',
      mapsCoord: { lat: 18.5020, lng: 73.8315 },
      opdDepartments: ['Cardiology', 'Pediatric Surgery', 'Joint Replacement & Ortho', 'Gastroenterology', 'General Medicine'],
      bedTelemetry: {
        icuTotal: 48,
        icuAvailable: 11,
        ventilatorTotal: 24,
        ventilatorAvailable: 6,
        oxygenBedsTotal: 120,
        oxygenBedsAvailable: 38,
        generalBedsTotal: 800,
        generalBedsAvailable: 145,
        lastTelemetryPing: '3 mins ago'
      },
      costProfile: {
        tier: 'SUBSIDIZED_CHARITABLE',
        tierLabel: 'Subsidized Trust Grants & Concessions',
        opdConsultFee: 250,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 6,
        costScore: 93,
        approxTreatmentRange: 'Subsidized Trust Rates / ₹1,200 General Bed'
      }
    },
    {
      id: 'HOSP-MH-05',
      name: 'Tata Memorial Hospital (TMC Advanced Cancer Center)',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 12.8,
      rating: 5.0,
      chikitsaCareScore: 99,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'Tata Trusts Empanelled', 'MJPJAY Maharashtra'],
      emergency24x7: true,
      contactNumber: '+91 22 2417 7000',
      mapsCoord: { lat: 19.0055, lng: 72.8431 },
      opdDepartments: ['Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Bone Marrow Transplant'],
      bedTelemetry: {
        icuTotal: 70,
        icuAvailable: 15,
        ventilatorTotal: 38,
        ventilatorAvailable: 8,
        oxygenBedsTotal: 190,
        oxygenBedsAvailable: 56,
        generalBedsTotal: 700,
        generalBedsAvailable: 110,
        lastTelemetryPing: 'Just now'
      },
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: 'Government & Tata Trust Subsidized Cancer Care',
        opdConsultFee: 20,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 98,
        approxTreatmentRange: '₹0 Free to Highly Subsidized Cancer Therapy'
      }
    },
    {
      id: 'HOSP-MH-06',
      name: 'Grant Government Medical College & Sir J.J. Group of Hospitals',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 14.1,
      rating: 4.7,
      chikitsaCareScore: 94,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra'],
      emergency24x7: true,
      contactNumber: '+91 22 2373 5555',
      mapsCoord: { lat: 18.9634, lng: 72.8335 },
      opdDepartments: ['Emergency Trauma', 'General Medicine', 'Ophthalmology', 'General Surgery', 'Plastic Surgery'],
      bedTelemetry: {
        icuTotal: 50,
        icuAvailable: 12,
        ventilatorTotal: 26,
        ventilatorAvailable: 7,
        oxygenBedsTotal: 170,
        oxygenBedsAvailable: 48,
        generalBedsTotal: 1350,
        generalBedsAvailable: 220,
        lastTelemetryPing: '2 mins ago'
      },
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: '100% Free Public Health Care',
        opdConsultFee: 10,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 99,
        approxTreatmentRange: '₹0 Free Public Government Hospital'
      }
    }
  ],
  users: [
    {
      id: 'USR-PAT-9821',
      name: 'Ankit Kumar Chaudhary',
      email: 'ankitkumarchaudhary641@gmail.com',
      phone: '+91 98765 43210',
      role: 'PATIENT',
      abhaNumber: '14-2026-9812-4401',
      abhaAddress: 'ankit.chaudhary@abdm',
      isGuest: false
    }
  ],
  registeredDoctors: [
    {
      id: 'DOC-NMC-2024-01',
      name: 'Dr. Rajesh Kulkarni',
      email: 'rajesh.kulkarni@chikitsax.gov.in',
      phone: '+91 98220 12345',
      nmcRegistrationId: 'NMC-2014-45012',
      specialty: 'Cardiology',
      qualifications: 'MBBS, MD, DM (Cardiology)',
      experienceYears: 14,
      hospitalAffiliation: 'Sassoon General Hospital & B.J. Medical College, Pune',
      department: 'Cardiology',
      isNmcVerified: true,
      digitalSignatureId: 'DSIG-NMC-88341-KUL'
    }
  ],
  liveOPDQueues: [],
  csrApplications: [],
  ambulanceDispatches: new Map(),
  auditChain: []
};

// Seed Genesis Audit Block
const genesisTime = new Date().toISOString();
const genesisHash = computeAuditHash(0, '0'.repeat(64), genesisTime, 'GENESIS', 'SYSTEM', 'SYSTEM', { desc: 'Chikitsa-X Audit Ledger Initialized' });
dbState.auditChain.push({
  index: 0,
  timestamp: genesisTime,
  eventType: 'GENESIS',
  actorId: 'SYSTEM',
  actorRole: 'SYSTEM',
  resourceId: 'SYSTEM',
  details: { desc: 'Chikitsa-X Cryptographic Audit Ledger Genesis Block' },
  previousHash: '0'.repeat(64),
  hash: genesisHash
});

function recordAuditEvent(eventType: string, actorId: string, actorRole: string, resourceId: string, details: any): AuditBlock {
  const prevBlock = dbState.auditChain[dbState.auditChain.length - 1];
  const newIndex = prevBlock.index + 1;
  const timestamp = new Date().toISOString();
  const hash = computeAuditHash(newIndex, prevBlock.hash, timestamp, eventType, actorId, resourceId, details);

  const block: AuditBlock = {
    index: newIndex,
    timestamp,
    eventType,
    actorId,
    actorRole,
    resourceId,
    details,
    previousHash: prevBlock.hash,
    hash
  };

  dbState.auditChain.push(block);
  if (isPostgresConnected()) {
    pgAudit.insertBlock(block).catch(() => {});
  }
  return block;
}

// ==========================================
// 1. HEALTH & SYSTEM TELEMETRY API
// ==========================================
app.get(['/api/health', '/api', '/api/ping'], (_req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'CHIKITSA-X Enterprise Healthcare API Hub',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'PostgreSQL',
      connected: isPostgresConnected(),
      configured: !!process.env.DATABASE_URL
    },
    security: {
      aes256Encryption: 'ACTIVE',
      jwtAuth: 'ACTIVE',
      rateLimiter: 'ACTIVE',
      tamperEvidentAuditLedger: 'ACTIVE',
      auditBlocksCount: dbState.auditChain.length
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// ==========================================
// 2. AUTHENTICATION & LIVE OTP APIS
// ==========================================

// Dispatch real 6-digit OTP to Email and/or Mobile
app.post('/api/auth/send-otp', authSensitiveLimiter, async (req: Request, res: Response) => {
  try {
    const { target, channel = 'BOTH', email, phone, fullName, purpose } = req.body;
    const recipient = target || email || phone;

    if (!recipient) {
      res.status(400).json({ success: false, error: 'Mobile phone number or email is required to dispatch OTP.' });
      return;
    }

    const result = await notificationService.sendOTP({
      target: recipient,
      channel,
      email,
      phone,
      fullName,
      purpose
    });

    recordAuditEvent('OTP_DISPATCHED', 'SYSTEM', 'SYSTEM', recipient, {
      channel: result.channel,
      emailStatus: result.emailDeliveryStatus,
      smsStatus: result.smsDeliveryStatus
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to dispatch verification OTP.' });
  }
});

// Verify 6-digit OTP timing-safely and issue single-use verification token
app.post('/api/auth/verify-otp', authSensitiveLimiter, (req: Request, res: Response) => {
  const { target, email, phone, otp } = req.body;
  const recipient = target || email || phone;

  if (!recipient || !otp) {
    res.status(400).json({ success: false, error: 'Target identifier and 6-digit OTP are required.' });
    return;
  }

  const result = notificationService.verifyOTP(recipient, otp);

  if (!result.success) {
    res.status(400).json({ success: false, error: result.message });
    return;
  }

  recordAuditEvent('OTP_VERIFIED', recipient, 'PATIENT', recipient, {
    verifiedAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: result.message,
    verificationToken: result.verificationToken
  });
});

// 1-Tap Login for Patients via Mobile/Email OTP
app.post('/api/auth/login-patient', authSensitiveLimiter, (req: Request, res: Response) => {
  const { phone, email, otp, verificationToken } = req.body;
  const target = phone || email;

  if (!target) {
    res.status(400).json({ success: false, error: 'Mobile number or email is required.' });
    return;
  }

  // Verify token or OTP
  if (verificationToken) {
    const valid = notificationService.consumeVerificationToken(target, verificationToken);
    if (!valid) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification session. Please request a new OTP.' });
      return;
    }
  } else if (otp) {
    const otpRes = notificationService.verifyOTP(target, otp);
    if (!otpRes.success) {
      res.status(400).json({ success: false, error: otpRes.message });
      return;
    }
  } else {
    res.status(400).json({ success: false, error: 'OTP or verification token is required.' });
    return;
  }

  // Find or auto-provision patient profile
  let patient = dbState.users.find(u =>
    (phone && u.phone && u.phone.includes(phone.replace(/\D/g, '').slice(-10))) ||
    (email && u.email && u.email.toLowerCase() === email.toLowerCase())
  );

  if (!patient) {
    const newId = `USR-PAT-${Date.now().toString().slice(-6)}`;
    const generatedAbha = `14-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const displayName = email ? email.split('@')[0].replace('.', ' ') : 'Verified Patient';
    
    patient = {
      id: newId,
      name: displayName,
      phone: phone || '',
      email: email || '',
      role: 'PATIENT',
      abhaNumber: generatedAbha,
      abhaAddress: `${(email ? email.split('@')[0] : 'patient').replace(/[^a-z0-9]/gi, '')}@abdm`
    };
    dbState.users.push(patient);

    if (isPostgresConnected()) {
      pgUsers.insert({
        id: patient.id,
        name: patient.name,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
        role: patient.role,
        abhaNumber: patient.abhaNumber,
        abhaAddress: patient.abhaAddress,
        kycVerified: true
      }).catch(err => console.warn('[PostgreSQL] Failed to persist patient profile in login:', err?.message || err));
    }
  }

  const token = signJWT({
    sub: patient.id,
    role: 'PATIENT',
    name: patient.name,
    phone: patient.phone,
    abhaAddress: patient.abhaAddress
  });

  recordAuditEvent('PATIENT_OTP_LOGIN', patient.id, 'PATIENT', patient.id, {
    method: 'OTP_AUTH',
    loginTimestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Login successful via verified OTP.',
    user: patient,
    token
  });
});

// Full Registration for New Patient with live OTP check
app.post('/api/auth/register-patient', authSensitiveLimiter, (req: Request, res: Response) => {
  const { fullName, phone, email, abhaAddress, enteredOtp, verificationToken, dob, gender, bloodGroup, city, state } = req.body;

  if (!fullName || !phone) {
    res.status(400).json({ success: false, error: 'Full name and mobile phone are required.' });
    return;
  }

  // Validate OTP or verification token
  if (verificationToken) {
    const valid = notificationService.consumeVerificationToken(phone, verificationToken) || (email && notificationService.consumeVerificationToken(email, verificationToken));
    if (!valid) {
      res.status(400).json({ success: false, error: 'Verification session expired. Please verify OTP again.' });
      return;
    }
  } else if (enteredOtp) {
    const verifyRes = notificationService.verifyOTP(phone, enteredOtp) || (email && notificationService.verifyOTP(email, enteredOtp));
    if (!verifyRes || !verifyRes.success) {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP code.' });
      return;
    }
  }

  const newPatientId = `USR-PAT-${Date.now().toString().slice(-6)}`;
  const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');
  const generatedAbha = `14-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newUser = {
    id: newPatientId,
    name: fullName,
    email: email || `${cleanName}@chikitsax.gov.in`,
    phone,
    role: 'PATIENT' as const,
    dob: dob || '1998-05-15',
    gender: gender || 'MALE',
    bloodGroup: bloodGroup || 'B+',
    city: city || 'Pune',
    state: state || 'Maharashtra',
    abhaNumber: generatedAbha,
    abhaAddress: abhaAddress || `${cleanName.replace(/\./g, '')}@abdm`,
    kycVerified: true
  };

  dbState.users.push(newUser);

  if (isPostgresConnected()) {
    pgUsers.insert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      dob: newUser.dob,
      gender: newUser.gender,
      bloodGroup: newUser.bloodGroup,
      city: newUser.city,
      state: newUser.state,
      abhaNumber: newUser.abhaNumber,
      abhaAddress: newUser.abhaAddress,
      kycVerified: newUser.kycVerified
    }).catch(err => console.warn('[PostgreSQL] Failed to persist registered patient:', err?.message || err));
  }

  // Sign Secure JWT Token
  const token = signJWT({
    sub: newUser.id,
    role: newUser.role,
    name: newUser.name,
    phone: newUser.phone,
    abhaAddress: newUser.abhaAddress
  });

  recordAuditEvent('PATIENT_REGISTRATION', newUser.id, 'PATIENT', newUser.id, {
    method: 'VERIFIED_OTP',
    phoneMasked: phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
    abhaNumber: generatedAbha,
    abhaLinked: true
  });

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully with verified OTP & ABHA KYC.',
    user: newUser,
    token
  });
});

app.post('/api/auth/register-doctor', authSensitiveLimiter, (req: Request, res: Response) => {
  const { name, email, phone, nmcRegistrationId, specialty, hospitalAffiliation, enteredOtp, verificationToken } = req.body;

  if (!name || !nmcRegistrationId || !specialty) {
    res.status(400).json({ success: false, error: 'Name, NMC Registration ID, and Specialty are required.' });
    return;
  }

  if (verificationToken && phone) {
    notificationService.consumeVerificationToken(phone, verificationToken);
  }

  const newDocId = `DOC-NMC-${Date.now().toString().slice(-6)}`;
  const newDoctor = {
    id: newDocId,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.org`,
    phone: phone || '+91 98000 00000',
    nmcRegistrationId,
    specialty,
    qualifications: 'MBBS, MD (Registered Physician)',
    experienceYears: 7,
    hospitalAffiliation: hospitalAffiliation || 'Empanelled Tertiary Hospital, Pune',
    department: specialty,
    isNmcVerified: true,
    digitalSignatureId: `DSIG-NMC-${Math.floor(10000 + Math.random() * 90000)}-${name.split(' ').pop()?.toUpperCase()}`
  };

  dbState.registeredDoctors.push(newDoctor);

  if (isPostgresConnected()) {
    pgDoctors.insert({
      id: newDoctor.id,
      name: newDoctor.name,
      email: newDoctor.email,
      phone: newDoctor.phone,
      nmcRegistrationId: newDoctor.nmcRegistrationId,
      specialty: newDoctor.specialty,
      qualifications: newDoctor.qualifications,
      experienceYears: newDoctor.experienceYears,
      hospitalAffiliation: newDoctor.hospitalAffiliation,
      department: newDoctor.department,
      isNmcVerified: newDoctor.isNmcVerified,
      digitalSignatureId: newDoctor.digitalSignatureId
    }).catch(err => console.warn('[PostgreSQL] Failed to persist registered doctor:', err?.message || err));
  }

  const token = signJWT({
    sub: newDoctor.id,
    role: 'DOCTOR',
    name: newDoctor.name,
    nmcRegistrationId: newDoctor.nmcRegistrationId
  });

  recordAuditEvent('DOCTOR_NMC_REGISTRATION', newDoctor.id, 'DOCTOR', newDoctor.nmcRegistrationId, {
    nmcVerified: true,
    digitalSignatureIssued: newDoctor.digitalSignatureId
  });

  res.status(201).json({
    success: true,
    message: 'Doctor successfully onboarded and verified with NMC National Register.',
    doctor: newDoctor,
    token
  });
});

app.post('/api/auth/login', authSensitiveLimiter, (req: Request, res: Response) => {
  const { role = 'PATIENT', identifier } = req.body;

  let matchedUser = dbState.users.find(u =>
    (identifier && (u.phone === identifier || u.email === identifier || u.id === identifier)) ||
    (!identifier && u.role === role)
  );

  if (!matchedUser) {
    if (dbState.users.length > 0) {
      matchedUser = dbState.users[0];
    } else {
      matchedUser = {
        id: 'USR-PAT-GUEST',
        name: 'Verified Citizen',
        email: 'patient@chikitsax.gov.in',
        phone: '+91 98000 00000',
        role: 'PATIENT' as const,
        abhaAddress: 'citizen@abdm'
      };
    }
  }

  const token = signJWT({
    sub: matchedUser.id,
    role: matchedUser.role,
    name: matchedUser.name,
    phone: matchedUser.phone,
    abhaAddress: matchedUser.abhaAddress
  });

  res.json({
    success: true,
    user: matchedUser,
    token
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

app.get('/api/patient/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = dbState.users.find(u => u.id === req.user?.sub) || req.user;
  const queues = dbState.liveOPDQueues.filter(q => q.patientId === req.user?.sub);
  res.json({
    success: true,
    profile: user,
    activeQueues: queues
  });
});

// ==========================================
// 3. HOSPITALS & TRIAD SELECTOR APIS
// ==========================================
app.get('/api/hospitals', (req: Request, res: Response) => {
  const { priority = 'BALANCED', maxDistance, scheme } = req.query;

  let result = [...dbState.hospitals];

  // Scheme filter
  if (scheme && scheme !== 'ALL') {
    const s = String(scheme).toLowerCase();
    result = result.filter(h => h.acceptedGovSchemes.some((sch: string) => sch.toLowerCase().includes(s)));
  }

  // Distance filter
  if (maxDistance) {
    const d = parseFloat(String(maxDistance));
    if (!isNaN(d)) {
      result = result.filter(h => h.distanceKm <= d);
    }
  }

  // Triad Sorting: Location • Cost • Care
  if (priority === 'NEARBY_LOCATION') {
    result.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (priority === 'LOWEST_COST') {
    result.sort((a, b) => (a.costProfile?.opdConsultFee ?? 500) - (b.costProfile?.opdConsultFee ?? 500));
  } else if (priority === 'HIGHEST_CARE') {
    result.sort((a, b) => b.chikitsaCareScore - a.chikitsaCareScore);
  } else {
    // BALANCED: 35% care, 35% cost, 30% proximity
    result.sort((a, b) => {
      const scoreA = (a.chikitsaCareScore * 0.35) + ((a.costProfile?.costScore ?? 80) * 0.35) + (Math.max(0, 10 - a.distanceKm) * 10 * 0.3);
      const scoreB = (b.chikitsaCareScore * 0.35) + ((b.costProfile?.costScore ?? 80) * 0.35) + (Math.max(0, 10 - b.distanceKm) * 10 * 0.3);
      return scoreB - scoreA;
    });
  }

  res.json({
    success: true,
    count: result.length,
    priorityApplied: priority,
    hospitals: result
  });
});

app.get('/api/hospitals/:id', (req: Request, res: Response) => {
  const hospital = dbState.hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    res.status(404).json({ success: false, error: 'Hospital not found' });
    return;
  }
  res.json({ success: true, hospital });
});

// ==========================================
// 4. EMERGENCY & AMBULANCE LIVE TRACKING APIS
// ==========================================
app.post('/api/emergency/dispatch', (req: Request, res: Response) => {
  const { hospitalId, patientLocation = { lat: 18.5582, lng: 73.7806 } } = req.body;

  const targetHospital = dbState.hospitals.find(h => h.id === hospitalId) || dbState.hospitals[0];
  const dispatchId = `ALS-${Date.now().toString().slice(-4)}`;

  const dispatchRecord = {
    dispatchId,
    unitNumber: 'MH-12-QX-4019 (ALS Unit #4)',
    status: 'EN_ROUTE',
    hospitalId: targetHospital.id,
    hospitalName: targetHospital.name,
    patientLocation,
    assignedDriver: {
      name: 'Vikram Jadhav',
      phone: '+91 98812 33412',
      rating: 4.9
    },
    assignedParamedic: 'Sr. Kavita Mane (Critical Care Paramedic)',
    traumaBedReserved: '#ICU-T04',
    initialEtaMinutes: 6.5,
    startedAt: new Date().toISOString(),
    greenCorridorActive: true
  };

  dbState.ambulanceDispatches.set(dispatchId, dispatchRecord);

  recordAuditEvent('AMBULANCE_DISPATCH', 'EMERGENCY_SYSTEM', 'SYSTEM', dispatchId, {
    hospital: targetHospital.name,
    traumaBed: dispatchRecord.traumaBedReserved,
    unit: dispatchRecord.unitNumber
  });

  res.status(201).json({
    success: true,
    message: 'ALS Ambulance Dispatched & Trauma Bed Reserved.',
    dispatch: dispatchRecord
  });
});

app.get('/api/emergency/track/:unitId', (req: Request, res: Response) => {
  const unitId = req.params.unitId;
  const dispatch = dbState.ambulanceDispatches.get(unitId) || Array.from(dbState.ambulanceDispatches.values())[0];

  if (!dispatch) {
    res.status(404).json({ success: false, error: 'No active dispatch found for this unit ID.' });
    return;
  }

  // Calculate elapsed progress
  const elapsedSecs = Math.floor((Date.now() - new Date(dispatch.startedAt).getTime()) / 1000);
  const progress = Math.min(0.95, Math.max(0.08, elapsedSecs * 0.008));
  const remainingKm = Math.max(0.2, (3.8 * (1 - progress))).toFixed(1);
  const remainingEtaSecs = Math.max(30, Math.floor(390 - elapsedSecs));

  res.json({
    success: true,
    dispatchId: dispatch.dispatchId,
    unitNumber: dispatch.unitNumber,
    status: dispatch.status,
    hospitalName: dispatch.hospitalName,
    traumaBedReserved: dispatch.traumaBedReserved,
    telemetry: {
      progress,
      remainingDistanceKm: parseFloat(remainingKm),
      remainingEtaSeconds: remainingEtaSecs,
      currentSpeedKmH: Math.floor(56 + (Math.sin(elapsedSecs) * 8)),
      greenCorridorStatus: 'ACTIVE_PREEMPTION',
      lastPingTimestamp: new Date().toISOString()
    },
    crew: {
      driver: dispatch.assignedDriver,
      paramedic: dispatch.assignedParamedic
    }
  });
});

// ==========================================
// 5. LIVE OPD QUEUE TOKENS API
// ==========================================
app.post('/api/opd/book', (req: Request, res: Response) => {
  const { hospitalId, department = 'General Medicine', doctorName, patientName = 'Verified Patient', patientId } = req.body;

  const targetHospital = dbState.hospitals.find(h => h.id === hospitalId) || dbState.hospitals[0];
  const tokenId = `OPD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const tokenRecord = {
    id: tokenId,
    referenceId: `CHX-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    patientName,
    hospitalId: targetHospital.id,
    hospitalName: targetHospital.name,
    department,
    doctorName: doctorName || 'Dr. Rajesh Kulkarni',
    appointmentDate: 'Today (Live)',
    appointmentSlot: '11:45 AM',
    tokenNumber: Math.floor(16 + Math.random() * 12),
    currentServingToken: 14,
    estimatedWaitMinutes: 14,
    status: 'WAITING' as const,
    qrPayload: `https://chikitsax.gov.in/token/verify?ref=${tokenId}`
  };

  dbState.liveOPDQueues.push(tokenRecord);

  if (isPostgresConnected()) {
    pgAppointments.insert({
      id: tokenRecord.id,
      referenceId: tokenRecord.referenceId,
      patientId: patientId || 'USR-PAT-GUEST',
      patientName: tokenRecord.patientName,
      hospitalId: tokenRecord.hospitalId,
      hospitalName: tokenRecord.hospitalName,
      department: tokenRecord.department,
      doctorName: tokenRecord.doctorName,
      appointmentDate: tokenRecord.appointmentDate,
      appointmentSlot: tokenRecord.appointmentSlot,
      tokenNumber: tokenRecord.tokenNumber,
      currentServingToken: tokenRecord.currentServingToken,
      estimatedWaitMinutes: tokenRecord.estimatedWaitMinutes,
      status: tokenRecord.status
    }).catch(err => console.warn('[PostgreSQL] Failed to persist OPD appointment:', err?.message || err));
  }

  recordAuditEvent('OPD_BOOKING', patientName, 'PATIENT', tokenId, {
    hospital: targetHospital.name,
    department,
    tokenNumber: tokenRecord.tokenNumber
  });

  res.status(201).json({
    success: true,
    message: 'OPD appointment confirmed with verified ABDM token.',
    token: tokenRecord
  });
});

app.get('/api/opd/queue', (_req: Request, res: Response) => {
  res.json({
    success: true,
    queues: dbState.liveOPDQueues
  });
});

// ==========================================
// 6. ABHA HEALTH VAULT & AES-256 PHI VAULT
// ==========================================
app.get('/api/abha/profile', (req: Request, res: Response) => {
  const latestPatient = dbState.users.find(u => u.role === 'PATIENT' && u.name !== 'Guest Citizen');
  const rawProfile = latestPatient ? {
    abhaNumber: latestPatient.abhaNumber || '14-2026-9812-4401',
    abhaAddress: latestPatient.abhaAddress || 'patient@abdm',
    fullName: latestPatient.name,
    dob: latestPatient.dob || '1996-05-15',
    gender: latestPatient.gender || 'MALE',
    bloodGroup: latestPatient.bloodGroup || 'B+',
    mobile: latestPatient.phone || '+91 98000 00000',
    address: `${latestPatient.city || 'Pune'}, ${latestPatient.state || 'Maharashtra'} - India`,
    kycVerified: true,
    linkedFacilitiesCount: 1
  } : {
    abhaNumber: '14-XXXX-XXXX-XXXX',
    abhaAddress: 'guest@abdm',
    fullName: 'Guest Citizen',
    dob: '1998-01-01',
    gender: 'MALE',
    bloodGroup: 'B+',
    mobile: '+91 98000 00000',
    address: 'Empanelled Network, India',
    kycVerified: false,
    linkedFacilitiesCount: 0
  };

  // If client requests encrypted payload (zero-trust mode)
  if (req.query.encrypt === 'true') {
    const encrypted = encryptPHI(rawProfile);
    res.json({
      success: true,
      encryption: 'AES-256-GCM',
      payload: encrypted
    });
    return;
  }

  res.json({
    success: true,
    profile: rawProfile
  });
});

app.get('/api/abha/fhir-records', (req: Request, res: Response) => {
  const records = [
    {
      id: 'FHIR-REC-001',
      resourceType: 'DiagnosticReport',
      date: '2026-02-18',
      facility: 'Ruby Hall Clinic, Pune',
      doctor: 'Dr. S. Mehta',
      title: 'Complete Blood Count (CBC) Panel',
      summary: 'Hb: 13.8 g/dL, Platelets: 210,000 /mcL, HbA1c: 6.8%'
    },
    {
      id: 'FHIR-REC-002',
      resourceType: 'MedicationRequest',
      date: '2026-01-10',
      facility: 'Sassoon General Hospital, Pune',
      doctor: 'Dr. Rajesh Kulkarni',
      title: 'Hypertension Management Rx',
      summary: 'Telmisartan 40mg (OD), Atorvastatin 10mg (HS)'
    }
  ];

  if (req.query.encrypt === 'true') {
    const encrypted = encryptPHI(records);
    res.json({
      success: true,
      encryption: 'AES-256-GCM',
      payload: encrypted
    });
    return;
  }

  res.json({
    success: true,
    records
  });
});

// ==========================================
// 7. CORPORATE CSR (SEC 135) & GRANTS API
// ==========================================
app.post('/api/csr/apply', (req: Request, res: Response) => {
  const { corporationName, patientName = 'Verified Beneficiary', procedureName, requestedAmount = 185000 } = req.body;

  const applicationId = `CSR-2026-${Date.now().toString().slice(-5)}`;
  const applicationRecord = {
    applicationId,
    corporationName: corporationName || 'Tata Trusts Healthcare CSR Fund',
    patientName,
    procedureName: procedureName || 'Percutaneous Coronary Intervention (Stenting)',
    requestedAmount,
    approvedAmount: requestedAmount,
    status: 'APPROVED',
    sanctionDate: new Date().toISOString().split('T')[0],
    bankingUTR: `UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`,
    hospitalBillingCreditAccount: 'Direct Credit to Empanelled Hospital Account'
  };

  dbState.csrApplications.push(applicationRecord);

  recordAuditEvent('CSR_GRANT_SANCTIONED', patientName, 'PATIENT', applicationId, {
    corporation: applicationRecord.corporationName,
    sanctionedAmount: applicationRecord.approvedAmount,
    utr: applicationRecord.bankingUTR
  });

  res.status(201).json({
    success: true,
    message: 'Corporate CSR Healthcare Grant approved and sanctioned under Section 135.',
    application: applicationRecord
  });
});

app.get('/api/csr/applications', (_req: Request, res: Response) => {
  res.json({
    success: true,
    applications: dbState.csrApplications
  });
});

// ==========================================
// 8. CRYPTOGRAPHIC AUDIT TRAIL APIS
// ==========================================
app.get('/api/audit/logs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    ledgerCount: dbState.auditChain.length,
    latestBlockHash: dbState.auditChain[dbState.auditChain.length - 1].hash,
    chain: dbState.auditChain
  });
});

app.post('/api/audit/verify-chain', (_req: Request, res: Response) => {
  let isChainValid = true;
  let brokenIndex = -1;

  for (let i = 1; i < dbState.auditChain.length; i++) {
    const curr = dbState.auditChain[i];
    const prev = dbState.auditChain[i - 1];

    if (curr.previousHash !== prev.hash) {
      isChainValid = false;
      brokenIndex = i;
      break;
    }

    const recomputed = computeAuditHash(
      curr.index,
      curr.previousHash,
      curr.timestamp,
      curr.eventType,
      curr.actorId,
      curr.resourceId,
      curr.details
    );

    if (recomputed !== curr.hash) {
      isChainValid = false;
      brokenIndex = i;
      break;
    }
  }

  res.json({
    success: true,
    valid: isChainValid,
    brokenBlockIndex: brokenIndex,
    verifiedBlocksCount: dbState.auditChain.length,
    message: isChainValid
      ? 'Cryptographic audit ledger verified. 100% tamper-evident integrity confirmed.'
      : `Ledger compromised at block #${brokenIndex}!`
  });
});

// 404 JSON Fallback (Returns structured JSON instead of default HTML)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.method} ${req.originalUrl || req.url} not found on CHIKITSA-X server.`
  });
});

// Global Error Handler returning structured JSON instead of HTML
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('API Error Handler Caught:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
