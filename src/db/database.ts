import type {
  User,
  ABHAProfile,
  FHIRRecord,
  Hospital,
  LiveOPDToken,
  GenericDrugMapping,
  LabBiomarker,
  CareCostAssessment,
  MedicalEMIOption,
  CrowdfundingCampaign,
  SOAPClinicalNote,
  VoiceIntakeRecord,
  GovSchemeInfo,
  InsurancePolicyClaim,
  NGOGrantProgram,
  HospitalRegistrationForm,
  MasterAuditLogEntry,
  HospitalBedTelemetry,
  DoctorProfile,
  PatientRegistrationForm,
  DoctorRegistrationForm,
  CSRCareProgram,
  CSRApplication
} from '../types';

class ChikitsaDatabase {
  private currentUser: User = {
    id: 'USR-PAT-2026-01',
    name: 'Ankit Patel',
    email: 'patient@chikitsax.demo',
    role: 'PATIENT',
    phone: '+91 98201 54821',
    abhaAddress: 'ankit.patel@abdm'
  };

  private demoUsers: User[] = [
    {
      id: 'USR-PAT-2026-01',
      name: 'Ankit Patel',
      email: 'patient@chikitsax.demo',
      role: 'PATIENT',
      phone: '+91 98201 54821',
      abhaAddress: 'ankit.patel@abdm'
    },
    {
      id: 'USR-DOC-2026-02',
      name: 'Dr. Rajesh Kulkarni',
      email: 'doctor@chikitsax.demo',
      role: 'DOCTOR',
      phone: '+91 98220 11928',
      hospitalId: 'HOSP-01'
    },
    {
      id: 'USR-ADM-2026-03',
      name: 'Priya Sharma (Hospital Admin)',
      email: 'hospital@chikitsax.demo',
      role: 'HOSPITAL_ADMIN',
      phone: '+91 99304 88712',
      hospitalId: 'HOSP-01'
    }
  ];

  private registeredDoctors: DoctorProfile[] = [
    {
      id: 'DOC-NMC-2024-01',
      name: 'Dr. Rajesh Kulkarni',
      email: 'doctor@chikitsax.demo',
      phone: '+91 98220 11928',
      nmcRegistrationId: 'MCI-2012-44102',
      specialty: 'Interventional Cardiology',
      qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
      experienceYears: 14,
      hospitalAffiliation: 'CarePlus Tertiary Heart Hospital',
      department: 'Cardiology',
      isNmcVerified: true,
      digitalSignatureId: 'DSIG-NMC-88219-KULK'
    },
    {
      id: 'DOC-NMC-2024-02',
      name: 'Dr. Anita Sen',
      email: 'anita.sen@aiims.org',
      phone: '+91 98112 34567',
      nmcRegistrationId: 'NMC-2016-89211',
      specialty: 'General Medicine & Diabetology',
      qualifications: 'MBBS, MD (General Medicine)',
      experienceYears: 9,
      hospitalAffiliation: 'Ruby Hall Clinic, Pune',
      department: 'General Medicine',
      isNmcVerified: true,
      digitalSignatureId: 'DSIG-NMC-99124-SEN'
    }
  ];

  private abhaProfile: ABHAProfile = {
    abhaNumber: '14-2026-9812-4401',
    abhaAddress: 'ankit.patel@abdm',
    fullName: 'Ankit Patel',
    dob: '1995-08-14',
    gender: 'MALE',
    bloodGroup: 'O+',
    mobile: '+91 98201 54821',
    address: 'Flat 402, Shivam Enclave, Baner Road, Pune, Maharashtra - 411045',
    kycVerified: true,
    linkedFacilitiesCount: 4,
    qrPayload: 'https://healthid.ndhm.gov.in/verify?abha=14-2026-9812-4401'
  };

  private fhirRecords: FHIRRecord[] = [
    {
      id: 'FHIR-REC-001',
      resourceType: 'DiagnosticReport',
      date: '2026-02-18',
      facility: 'Ruby Hall Clinic, Pune',
      doctor: 'Dr. S. Mehta (Pathologist)',
      title: 'Complete Blood Count (CBC) & HbA1c Panel',
      summary: 'Hb: 13.8 g/dL, Platelets: 210,000 /mcL, HbA1c: 6.8% (Borderline pre-diabetic)',
      rawJsonUrl: 'https://abdm.gov.in/fhir/r4/DiagnosticReport/FHIR-REC-001'
    },
    {
      id: 'FHIR-REC-002',
      resourceType: 'MedicationRequest',
      date: '2026-01-10',
      facility: 'CarePlus Multi-Specialty Hospital',
      doctor: 'Dr. Rajesh Kulkarni (Cardiologist)',
      title: 'Hypertension & Lipid Management Rx',
      summary: 'Telmisartan 40mg (OD), Atorvastatin 10mg (HS). No active contraindications noted.',
      rawJsonUrl: 'https://abdm.gov.in/fhir/r4/MedicationRequest/FHIR-REC-002'
    },
    {
      id: 'FHIR-REC-003',
      resourceType: 'DischargeSummary',
      date: '2025-11-22',
      facility: 'KEM Hospital, Mumbai',
      doctor: 'Dr. A. Deshmukh',
      title: 'Elective Laparoscopic Appendectomy',
      summary: 'Uneventful post-operative recovery. Healed primary intention. Cleared for normal exertion.',
      rawJsonUrl: 'https://abdm.gov.in/fhir/r4/DischargeSummary/FHIR-REC-003'
    }
  ];

  private hospitals: Hospital[] = [
    {
      id: 'HOSP-01',
      name: 'CarePlus Tertiary Heart & Multi-Specialty Hospital',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'PRIVATE_EMPANELLED',
      distanceKm: 3.4,
      rating: 4.8,
      chikitsaCareScore: 94,
      acceptedGovSchemes: ['Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Tata Trusts Empanelled', 'CGHS'],
      emergency24x7: true,
      contactNumber: '+91 20 6609 9000',
      mapsCoord: { lat: 18.5204, lng: 73.8567 },
      opdDepartments: ['Cardiology', 'Orthopedics', 'General Medicine', 'Neurology', 'Pulmonology'],
      bedTelemetry: {
        icuTotal: 32,
        icuAvailable: 7,
        ventilatorTotal: 18,
        ventilatorAvailable: 4,
        oxygenBedsTotal: 65,
        oxygenBedsAvailable: 19,
        generalBedsTotal: 180,
        generalBedsAvailable: 42,
        lastTelemetryPing: 'Just now'
      },
      bloodBankStock: [
        { group: 'A+', units: 28, isCriticallyLow: false },
        { group: 'A-', units: 6, isCriticallyLow: false },
        { group: 'B+', units: 35, isCriticallyLow: false },
        { group: 'B-', units: 4, isCriticallyLow: true },
        { group: 'AB+', units: 14, isCriticallyLow: false },
        { group: 'AB-', units: 2, isCriticallyLow: true },
        { group: 'O+', units: 42, isCriticallyLow: false },
        { group: 'O-', units: 3, isCriticallyLow: true }
      ],
      costProfile: {
        tier: 'PMJAY_CASHLESS_MODERATE',
        tierLabel: 'PM-JAY 100% Cashless / Moderate Private',
        opdConsultFee: 500,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 12,
        costScore: 84,
        approxTreatmentRange: '100% Cashless via PM-JAY / ₹4,000 Private Day'
      }
    },
    {
      id: 'HOSP-02',
      name: 'AIIMS Apex Regional Institute of Medical Sciences',
      city: 'Pune / Mumbai Region',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 8.2,
      rating: 4.9,
      chikitsaCareScore: 96,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'National Rare Diseases Fund', 'PMNRF'],
      emergency24x7: true,
      contactNumber: '+91 20 2612 7000',
      mapsCoord: { lat: 18.5314, lng: 73.8446 },
      opdDepartments: ['Cardiology', 'Oncology', 'Gastroenterology', 'General Surgery', 'Pediatrics'],
      bedTelemetry: {
        icuTotal: 85,
        icuAvailable: 12,
        ventilatorTotal: 45,
        ventilatorAvailable: 8,
        oxygenBedsTotal: 220,
        oxygenBedsAvailable: 64,
        generalBedsTotal: 850,
        generalBedsAvailable: 110,
        lastTelemetryPing: '2 mins ago'
      },
      bloodBankStock: [
        { group: 'A+', units: 65, isCriticallyLow: false },
        { group: 'A-', units: 14, isCriticallyLow: false },
        { group: 'B+', units: 72, isCriticallyLow: false },
        { group: 'B-', units: 11, isCriticallyLow: false },
        { group: 'AB+', units: 29, isCriticallyLow: false },
        { group: 'AB-', units: 8, isCriticallyLow: false },
        { group: 'O+', units: 98, isCriticallyLow: false },
        { group: 'O-', units: 15, isCriticallyLow: false }
      ],
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: '100% Free Public Care (Zero Out-of-Pocket)',
        opdConsultFee: 20,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 98,
        approxTreatmentRange: '₹0 100% Free Government Treatment'
      }
    },
    {
      id: 'HOSP-03',
      name: 'Sanjeevani Charitable Trust Hospital',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'CHARITABLE_TRUST',
      distanceKm: 5.1,
      rating: 4.6,
      chikitsaCareScore: 89,
      acceptedGovSchemes: ['MJPJAY Maharashtra', 'Being Human Foundation', 'Smile Foundation Grant'],
      emergency24x7: true,
      contactNumber: '+91 20 2445 1100',
      mapsCoord: { lat: 18.5089, lng: 73.8540 },
      opdDepartments: ['General Medicine', 'Ophthalmology', 'ENT', 'Gynecology'],
      bedTelemetry: {
        icuTotal: 16,
        icuAvailable: 3,
        ventilatorTotal: 8,
        ventilatorAvailable: 2,
        oxygenBedsTotal: 40,
        oxygenBedsAvailable: 12,
        generalBedsTotal: 120,
        generalBedsAvailable: 28,
        lastTelemetryPing: '4 mins ago'
      },
      bloodBankStock: [
        { group: 'A+', units: 12, isCriticallyLow: false },
        { group: 'A-', units: 2, isCriticallyLow: true },
        { group: 'B+', units: 18, isCriticallyLow: false },
        { group: 'B-', units: 3, isCriticallyLow: true },
        { group: 'AB+', units: 6, isCriticallyLow: false },
        { group: 'AB-', units: 1, isCriticallyLow: true },
        { group: 'O+', units: 20, isCriticallyLow: false },
        { group: 'O-', units: 2, isCriticallyLow: true }
      ],
      costProfile: {
        tier: 'SUBSIDIZED_CHARITABLE',
        tierLabel: 'Subsidized Trust Grants & Concessions',
        opdConsultFee: 150,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 8,
        costScore: 91,
        approxTreatmentRange: 'Subsidized Trust Rates / ₹1,200 General Bed'
      }
    },
    {
      id: 'HOSP-04',
      name: 'District Civil & Government Super Specialty Hospital',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'GOVERNMENT',
      distanceKm: 1.9,
      rating: 4.7,
      chikitsaCareScore: 92,
      acceptedGovSchemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Rashtriya Arogya Nidhi'],
      emergency24x7: true,
      contactNumber: '+91 20 2553 4400',
      mapsCoord: { lat: 18.5480, lng: 73.7920 },
      opdDepartments: ['Emergency Trauma', 'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics'],
      bedTelemetry: {
        icuTotal: 28,
        icuAvailable: 9,
        ventilatorTotal: 14,
        ventilatorAvailable: 5,
        oxygenBedsTotal: 90,
        oxygenBedsAvailable: 34,
        generalBedsTotal: 340,
        generalBedsAvailable: 78,
        lastTelemetryPing: '1 min ago'
      },
      bloodBankStock: [
        { group: 'A+', units: 38, isCriticallyLow: false },
        { group: 'A-', units: 8, isCriticallyLow: false },
        { group: 'B+', units: 45, isCriticallyLow: false },
        { group: 'B-', units: 7, isCriticallyLow: false },
        { group: 'AB+', units: 19, isCriticallyLow: false },
        { group: 'AB-', units: 4, isCriticallyLow: true },
        { group: 'O+', units: 58, isCriticallyLow: false },
        { group: 'O-', units: 9, isCriticallyLow: false }
      ],
      costProfile: {
        tier: 'FREE_PUBLIC',
        tierLabel: '100% Free Public Health Care',
        opdConsultFee: 10,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 0,
        costScore: 99,
        approxTreatmentRange: '₹0 Free Public Government Hospital'
      }
    },
    {
      id: 'HOSP-05',
      name: 'Ruby Hall Superspeciality & Oncology Center',
      city: 'Pune',
      state: 'Maharashtra',
      type: 'PRIVATE_EMPANELLED',
      distanceKm: 6.2,
      rating: 4.9,
      chikitsaCareScore: 97,
      acceptedGovSchemes: ['Ayushman Bharat PM-JAY', 'Tata Trusts Empanelled', 'CGHS', 'ECHS', 'Corporate Insurance'],
      emergency24x7: true,
      contactNumber: '+91 20 6645 5000',
      mapsCoord: { lat: 18.5289, lng: 73.8744 },
      opdDepartments: ['Oncology', 'Cardiology', 'Neurology', 'Organ Transplant', 'Robotic Surgery'],
      bedTelemetry: {
        icuTotal: 60,
        icuAvailable: 15,
        ventilatorTotal: 32,
        ventilatorAvailable: 9,
        oxygenBedsTotal: 140,
        oxygenBedsAvailable: 48,
        generalBedsTotal: 450,
        generalBedsAvailable: 92,
        lastTelemetryPing: 'Just now'
      },
      bloodBankStock: [
        { group: 'A+', units: 50, isCriticallyLow: false },
        { group: 'A-', units: 12, isCriticallyLow: false },
        { group: 'B+', units: 62, isCriticallyLow: false },
        { group: 'B-', units: 10, isCriticallyLow: false },
        { group: 'AB+', units: 25, isCriticallyLow: false },
        { group: 'AB-', units: 6, isCriticallyLow: false },
        { group: 'O+', units: 84, isCriticallyLow: false },
        { group: 'O-', units: 12, isCriticallyLow: false }
      ],
      costProfile: {
        tier: 'PMJAY_CASHLESS_MODERATE',
        tierLabel: 'Super Specialty (PM-JAY Empanelled)',
        opdConsultFee: 650,
        pmjayCashlessCoverage: true,
        estOutOfPocketPercent: 15,
        costScore: 80,
        approxTreatmentRange: 'PM-JAY Cashless / ₹5,500 Private Suite'
      }
    }
  ];

  private liveOPDQueues: LiveOPDToken[] = [
    {
      id: 'OPD-2026-8A92F',
      referenceId: 'CHX-2026-8A92F',
      patientId: 'USR-PAT-2026-01',
      patientName: 'Ankit Patel',
      hospitalId: 'HOSP-01',
      hospitalName: 'CarePlus Tertiary Heart Hospital',
      department: 'Cardiology',
      doctorName: 'Dr. Rajesh Kulkarni',
      appointmentDate: 'Today (Live)',
      appointmentSlot: '11:30 AM',
      tokenNumber: 18,
      currentServingToken: 14,
      estimatedWaitMinutes: 16,
      status: 'WAITING',
      doctorDelayNotes: 'Doctor completing an emergency stenting procedure. Expected delay: ~5 mins.'
    }
  ];

  private genericDrugs: GenericDrugMapping[] = [
    {
      id: 'GEN-01',
      brandedName: 'Augmentin 625 Duo (GSK)',
      genericMolecule: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)',
      dosage: '10 Tablets Strip',
      brandedPrice: 224,
      janAushadhiPrice: 48,
      savingsPercentage: 78.5,
      category: 'Antibiotic'
    },
    {
      id: 'GEN-02',
      brandedName: 'Lipitor / Atorva 10mg (Pfizer/Zydus)',
      genericMolecule: 'Atorvastatin 10mg',
      dosage: '15 Tablets Strip',
      brandedPrice: 195,
      janAushadhiPrice: 22,
      savingsPercentage: 88.7,
      category: 'Cholesterol & Heart'
    },
    {
      id: 'GEN-03',
      brandedName: 'Januvia 100mg (MSD)',
      genericMolecule: 'Sitagliptin Phosphate 100mg',
      dosage: '7 Tablets Strip',
      brandedPrice: 380,
      janAushadhiPrice: 70,
      savingsPercentage: 81.5,
      category: 'Diabetes Care'
    },
    {
      id: 'GEN-04',
      brandedName: 'Pantocid 40mg (Sun Pharma)',
      genericMolecule: 'Pantoprazole Sodium 40mg',
      dosage: '15 Tablets Strip',
      brandedPrice: 168,
      janAushadhiPrice: 25,
      savingsPercentage: 85.1,
      category: 'Antacid / GERD'
    },
    {
      id: 'GEN-05',
      brandedName: 'Telma 40mg (Glenmark)',
      genericMolecule: 'Telmisartan 40mg',
      dosage: '15 Tablets Strip',
      brandedPrice: 142,
      janAushadhiPrice: 20,
      savingsPercentage: 85.9,
      category: 'Blood Pressure'
    },
    {
      id: 'GEN-06',
      brandedName: 'Montair LC (Cipla)',
      genericMolecule: 'Montelukast 10mg + Levocetirizine 5mg',
      dosage: '10 Tablets Strip',
      brandedPrice: 215,
      janAushadhiPrice: 38,
      savingsPercentage: 82.3,
      category: 'Allergy & Asthma'
    }
  ];

  private labBiomarkers: LabBiomarker[] = [
    {
      name: 'Hemoglobin (Hb)',
      hindiName: 'हीमोग्लोबिन',
      value: 13.8,
      unit: 'g/dL',
      normalRange: [13.0, 17.0],
      status: 'NORMAL',
      interpretation: 'Normal oxygen carrying capacity. No anemia detected.',
      hindiInterpretation: 'हीमोग्लोबिन स्तर सामान्य है। खून की कमी नहीं है।'
    },
    {
      name: 'Total Leukocyte Count (TLC/WBC)',
      hindiName: 'श्वेत रक्त कोशिकाएं (WBC)',
      value: 11800,
      unit: '/mcL',
      normalRange: [4000, 10500],
      status: 'ELEVATED',
      interpretation: 'Slightly elevated WBC count indicating active immune response or mild infection.',
      hindiInterpretation: 'डब्ल्यूबीसी थोड़ी बढ़ी हुई है, जो हल्के संक्रमण या सूजन का संकेत है।'
    },
    {
      name: 'Platelet Count',
      hindiName: 'प्लेटलेट्स',
      value: 210000,
      unit: '/mcL',
      normalRange: [150000, 450000],
      status: 'NORMAL',
      interpretation: 'Healthy clotting ability. Dengue / thrombocytopenia risk excluded.',
      hindiInterpretation: 'प्लेटलेट्स बिल्कुल सामान्य और सुरक्षित सीमा में हैं।'
    },
    {
      name: 'Fasting Blood Glucose',
      hindiName: 'फास्टिंग ब्लड शुगर',
      value: 112,
      unit: 'mg/dL',
      normalRange: [70, 99],
      status: 'ELEVATED',
      interpretation: 'Impaired fasting glucose (Pre-diabetes range). Diet & lifestyle modification recommended.',
      hindiInterpretation: 'ब्लड शुगर सामान्य से थोड़ा अधिक (प्री-डायबिटीक) है। खान-पान में सुधार करें।'
    },
    {
      name: 'HbA1c (3-Month Glycated Avg)',
      hindiName: 'एचबीए1सी (3 माह का औसत)',
      value: 6.7,
      unit: '%',
      normalRange: [4.0, 5.6],
      status: 'ELEVATED',
      interpretation: 'Early type 2 diabetic range. Endocrinology consult advised.',
      hindiInterpretation: '3 महीने का शुगर स्तर हल्का बढ़ा हुआ है। डॉक्टर से दवा की सलाह लें।'
    },
    {
      name: 'Serum Creatinine (Kidney)',
      hindiName: 'सीरम क्रिएटिनिन (किडनी)',
      value: 0.95,
      unit: 'mg/dL',
      normalRange: [0.7, 1.3],
      status: 'NORMAL',
      interpretation: 'Healthy glomerular filtration and normal kidney function.',
      hindiInterpretation: 'किडनी की कार्यप्रणाली पूरी तरह स्वस्थ है।'
    },
    {
      name: 'SGPT / ALT (Liver Enzyme)',
      hindiName: 'एसजीपीटी (लिवर एंजाइम)',
      value: 38,
      unit: 'U/L',
      normalRange: [7, 56],
      status: 'NORMAL',
      interpretation: 'Normal liver cell integrity. No hepatic injury detected.',
      hindiInterpretation: 'लिवर पूरी तरह सामान्य और स्वस्थ है।'
    },
    {
      name: 'Serum Total Cholesterol',
      hindiName: 'कुल कोलेस्ट्रॉल',
      value: 235,
      unit: 'mg/dL',
      normalRange: [125, 200],
      status: 'CRITICAL_HIGH',
      interpretation: 'Hypercholesterolemia. Elevated cardiovascular plaque risk. Statin therapy indicated.',
      hindiInterpretation: 'कोलेस्ट्रॉल खतरनाक रूप से बढ़ा हुआ है। तुरंत कार्डियोलॉजिस्ट से परामर्श लें।'
    }
  ];

  private crowdfundingCampaign: CrowdfundingCampaign = {
    id: 'CROWD-2026-901',
    patientName: 'Master Aarav (8 yrs)',
    diagnosis: 'Congenital Ventricular Septal Defect (Pediatric Open Heart Surgery)',
    hospitalName: 'CarePlus Pediatric Cardiac Center',
    targetAmount: 350000,
    raisedAmount: 268400,
    donorCount: 142,
    story: 'Young Aarav requires urgent corrective cardiac repair. While Ayushman Bharat PM-JAY and Tata Trusts covered ₹2,50,000, his family from rural Satara needs urgent micro-donations to bridge the critical ICU & post-op medication gap.',
    verifiedDoctorLetterUrl: 'https://chikitsax.gov.in/verify/doc-cert-aarav-901.pdf',
    qrDonationLink: 'upi://pay?pa=chikitsax.relief@sbi&pn=ChikitsaAid&am=500&cu=INR',
    daysRemaining: 4
  };

  private soapNotes: SOAPClinicalNote[] = [
    {
      id: 'SOAP-2026-001',
      patientId: 'USR-PAT-2026-01',
      doctorName: 'Dr. Rajesh Kulkarni, MD, DM (Cardiology)',
      hospitalName: 'CarePlus Heart Hospital',
      date: '2026-03-12',
      subjective: '31-year-old male presents with intermittent retrosternal tightness and exertional shortness of breath for 4 days. Worse on brisk walking. Relieved with rest.',
      objective: 'BP: 138/88 mmHg, HR: 82 bpm regular, SpO2: 98% room air. ECG shows sinus rhythm, mild non-specific ST changes in V4-V6. Total Cholesterol: 235 mg/dL.',
      assessment: 'Suspected Angina Pectoris (Class II NYHA) with Dyslipidemia. Risk factors: Family history, elevated LDL.',
      plan: '1. Fasting lipid profile & 2D-Echocardiogram tomorrow.\n2. TMT (Treadmill Test) if Echo normal.\n3. Start Atorvastatin 20mg HS + Metoprolol Succinate 25mg OD.\n4. PM-JAY pre-auth initiated for Angiography if symptoms recur.',
      prescriptions: [
        { medicine: 'Atorvastatin 20mg', dosage: '1 Tab', frequency: 'Bedtime (HS)', duration: '30 Days', genericAlternative: 'Jan Aushadhi Atorvastatin 20mg (₹26)' },
        { medicine: 'Metoprolol Succinate 25mg', dosage: '1 Tab', frequency: 'Morning after food (OD)', duration: '30 Days', genericAlternative: 'Jan Aushadhi Metoprolol 25mg (₹18)' },
        { medicine: 'Sorbitrate 5mg', dosage: '1 Tab SOS', frequency: 'Sublingual if chest pain occurs', duration: 'As needed', genericAlternative: 'Jan Aushadhi Isosorbide (₹8)' }
      ],
      digitalSignature: 'SHA256: 7f8a91c0e39b4d8f... [VERIFIED NMC-REG: 489201]',
      verifiedByQR: 'https://chikitsax.abdm.gov.in/verify/rx/SOAP-2026-001'
    }
  ];

  // Getters & Updaters
  getCurrentUser(): User {
    const saved = localStorage.getItem('chikitsax_v2_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return this.currentUser;
  }

  setCurrentUser(u: User): void {
    this.currentUser = u;
    localStorage.setItem('chikitsax_v2_user', JSON.stringify(u));
  }

  getDemoUsers(): User[] { return this.demoUsers; }
  getABHAProfile(): ABHAProfile { return this.abhaProfile; }
  getFHIRRecords(): FHIRRecord[] { return this.fhirRecords; }
  getHospitals(): Hospital[] { return this.hospitals; }
  getGenericDrugs(): GenericDrugMapping[] { return this.genericDrugs; }
  getLabBiomarkers(): LabBiomarker[] { return this.labBiomarkers; }
  getLiveOPDQueues(): LiveOPDToken[] { return this.liveOPDQueues; }
  getCrowdfundingCampaign(): CrowdfundingCampaign { return this.crowdfundingCampaign; }
  getSOAPNotes(): SOAPClinicalNote[] { return this.soapNotes; }

  // Queue Advance Simulation
  advanceQueueToken(opdId: string): LiveOPDToken | null {
    const q = this.liveOPDQueues.find(item => item.id === opdId);
    if (q && q.currentServingToken < q.tokenNumber) {
      q.currentServingToken += 1;
      q.estimatedWaitMinutes = Math.max(0, (q.tokenNumber - q.currentServingToken) * 4);
      if (q.currentServingToken === q.tokenNumber) {
        q.status = 'SERVING';
      }
      return { ...q };
    }
    return null;
  }

  // Create new OPD appointment
  bookOPDAppointment(
    hospitalId: string,
    department: string,
    doctorName: string,
    slot: string
  ): LiveOPDToken {
    const hosp = this.hospitals.find(h => h.id === hospitalId) || this.hospitals[0];
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const tokenNum = 19 + Math.floor(Math.random() * 5);
    const currentServing = tokenNum - (3 + Math.floor(Math.random() * 3));
    const waitMins = (tokenNum - currentServing) * 4;

    const newAppointment: LiveOPDToken = {
      id: `OPD-2026-${randNum}`,
      referenceId: `CHX-2026-${randNum}`,
      patientId: this.currentUser.id,
      patientName: this.currentUser.name,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      department,
      doctorName,
      appointmentDate: 'Today',
      appointmentSlot: slot,
      tokenNumber: tokenNum,
      currentServingToken: currentServing,
      estimatedWaitMinutes: waitMins,
      status: 'WAITING'
    };

    this.liveOPDQueues.unshift(newAppointment);
    return newAppointment;
  }

  // Calculate Care-To-Cost
  calculateFinancialGap(
    procedureGrossCost: number,
    hasPMJAY: boolean = true,
    hasMJPJAY: boolean = true,
    hasPrivateInsurance: boolean = true,
    hasNGOAid: boolean = true
  ): CareCostAssessment {
    let pmjaySubsidy = 0;
    let stateSubsidy = 0;
    let privateInsurance = 0;
    let ngoAid = 0;

    let remaining = procedureGrossCost;

    if (hasPMJAY) {
      pmjaySubsidy = Math.min(500000, remaining * 0.65);
      remaining -= pmjaySubsidy;
    }

    if (hasMJPJAY && remaining > 0) {
      stateSubsidy = Math.min(150000, remaining * 0.5);
      remaining -= stateSubsidy;
    }

    if (hasPrivateInsurance && remaining > 0) {
      privateInsurance = Math.min(remaining, 50000);
      remaining -= privateInsurance;
    }

    if (hasNGOAid && remaining > 0) {
      ngoAid = Math.min(remaining, 25000);
      remaining -= ngoAid;
    }

    const selfPay = Math.max(0, Math.round(remaining));
    return {
      procedureName: 'Coronary Angioplasty & Stenting (DES)',
      indicativeGrossCost: procedureGrossCost,
      pmjaySubsidy: Math.round(pmjaySubsidy),
      stateSchemeSubsidy: Math.round(stateSubsidy),
      privateInsuranceClaim: Math.round(privateInsurance),
      ngoCharitableGrant: Math.round(ngoAid),
      patientSelfPay: selfPay,
      netFinancialGap: selfPay,
      isCompletelyCashless: selfPay === 0
    };
  }

  // Calculate 0% EMI options for remaining gap
  calculateEMIOptions(amount: number): MedicalEMIOption[] {
    const tenures = [3, 6, 12, 24];
    return tenures.map(months => ({
      months,
      monthlyAmount: Math.round(amount / months),
      interestRate: 0,
      processingFee: 0,
      totalRepayment: amount,
      isZeroInterest: true
    }));
  }

  // Donate to crowdfunding
  contributeToCrowdfunding(amount: number): CrowdfundingCampaign {
    this.crowdfundingCampaign.raisedAmount += amount;
    this.crowdfundingCampaign.donorCount += 1;
    return { ...this.crowdfundingCampaign };
  }

  // Save new SOAP clinical note
  saveSOAPNote(note: Omit<SOAPClinicalNote, 'id' | 'digitalSignature' | 'verifiedByQR'>): SOAPClinicalNote {
    const fullNote: SOAPClinicalNote = {
      ...note,
      id: `SOAP-2026-${Math.floor(100 + Math.random() * 900)}`,
      digitalSignature: `SHA256:${Math.random().toString(16).substring(2, 10)}... [NMC-REG: 489201]`,
      verifiedByQR: `https://chikitsax.abdm.gov.in/verify/rx/${Date.now()}`
    };
    this.soapNotes.unshift(fullNote);
    return fullNote;
  }

  // Voice Intake Records History
  private voiceIntakeHistory: VoiceIntakeRecord[] = [
    {
      id: 'VOICE-INTAKE-901',
      timestamp: '2026-09-16 14:30',
      language: 'hi-IN',
      spokenTranscript: 'मुझे 3 दिन से सीने में तेज भारीपन और बाएं हाथ में खिंचाव हो रहा है, थोड़ा चलने पर सांस फूलती है।',
      englishTranslation: 'Severe chest tightness radiating to left arm with exertional dyspnea on walking for 3 days.',
      chiefComplaint: 'Acute Retrosternal Chest Discomfort & Exertional Dyspnea',
      extractedSymptoms: ['Chest tightness', 'Left arm radiation', 'Exertional dyspnea'],
      duration: '3 days',
      severity: 'SEVERE',
      painScaleVAS: 8,
      bodyRegion: 'Chest / Cardiovascular',
      isEmergencyRedFlag: true,
      redFlagReason: 'Substernal pressure radiating to left arm with exertional dyspnea indicates acute coronary syndrome risk.',
      recommendedSpecialty: 'Cardiology (Interventional)',
      clinicalImpression: 'Suspected Angina Pectoris / Acute Coronary Syndrome (I20.9). Immediate ECG, Troponin-I and 2D-ECHO warranted.',
      confidenceScore: 96
    },
    {
      id: 'VOICE-INTAKE-902',
      timestamp: '2026-09-12 09:15',
      language: 'hinglish',
      spokenTranscript: 'Last 2 days se high fever 102°F hai, severe headache aur body pain ho raha hai.',
      englishTranslation: 'High grade fever (102°F) with severe cephalalgia and generalized myalgia for 2 days.',
      chiefComplaint: 'Acute Febrile Illness with Cephalalgia & Myalgia',
      extractedSymptoms: ['High fever (102°F)', 'Severe headache', 'Bodyache / Myalgia'],
      duration: '2 days',
      severity: 'MODERATE',
      painScaleVAS: 6,
      bodyRegion: 'Head & Neck / General',
      isEmergencyRedFlag: false,
      recommendedSpecialty: 'General Medicine',
      clinicalImpression: 'Acute viral febrile syndrome (R50.9). CBC & Dengue NS1 / Malaria antigen advised if temperature persists.',
      confidenceScore: 92
    }
  ];

  getVoiceIntakeHistory(): VoiceIntakeRecord[] {
    return [...this.voiceIntakeHistory];
  }

  saveVoiceIntake(record: Omit<VoiceIntakeRecord, 'id' | 'timestamp'>): VoiceIntakeRecord {
    const newRecord: VoiceIntakeRecord = {
      ...record,
      id: `VOICE-INTAKE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.voiceIntakeHistory.unshift(newRecord);
    return newRecord;
  }

  // Government Health Schemes Data
  private govSchemes: GovSchemeInfo[] = [
    {
      id: 'GOV-SCHEME-01',
      name: 'Ayushman Bharat PM-JAY',
      hindiName: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      level: 'CENTRAL',
      maxCoverAmount: 500000,
      eligibleCategory: 'Socio-Economic Caste Census (SECC) / Antyodaya / BPL Families',
      keyBenefits: [
        '₹5,00,000 completely cashless annual secondary & tertiary healthcare cover per family',
        'Over 29,000 empaneled hospitals across India (public & private)',
        'Pre & post hospitalization coverage (up to 3 days prior, 15 days after discharge)',
        'No restrictions on family size, age, or gender; zero co-payment'
      ],
      requiredDocs: ['Aadhaar Card', 'Ration Card / PM Letter / ABHA ID'],
      applicationPortalUrl: 'https://mera.pmjay.gov.in',
      tollFreeHelpline: '14555 / 1800-111-565',
      isEligibleDemo: true
    },
    {
      id: 'GOV-SCHEME-02',
      name: 'Rashtriya Arogya Nidhi (RAN)',
      hindiName: 'राष्ट्रीय आरोग्य निधि',
      level: 'CENTRAL',
      maxCoverAmount: 1500000,
      eligibleCategory: 'Patients below poverty line suffering from major life-threatening diseases',
      keyBenefits: [
        'Up to ₹15,00,000 one-time financial grant for super-specialty treatment',
        'Direct disbursement to government super-specialty hospitals / AIIMS',
        'Covers oncology, cardiology, organ transplant, neurosurgery'
      ],
      requiredDocs: ['Income Certificate (< ₹50,000/yr)', 'Hospital Treatment Estimate', 'Ration Card', 'Aadhaar Card'],
      applicationPortalUrl: 'https://mohfw.gov.in/ran',
      tollFreeHelpline: '011-23061986',
      isEligibleDemo: true
    },
    {
      id: 'GOV-SCHEME-03',
      name: 'Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)',
      hindiName: 'महात्मा ज्योतिबा फुले जन आरोग्य योजना',
      level: 'STATE',
      state: 'Maharashtra',
      maxCoverAmount: 500000,
      eligibleCategory: 'Yellow/Orange Ration Card Holders & Annapurna card holders in Maharashtra',
      keyBenefits: [
        '₹5,00,000 cashless family cover across 996 empaneled medical procedures',
        'Covers polytrauma, knee replacement, angioplasty, burn ICU care',
        'Free consultations and prescribed follow-up medications'
      ],
      requiredDocs: ['Yellow/Orange Ration Card', 'Aadhaar Card', 'Domicile Certificate'],
      applicationPortalUrl: 'https://jeevandayee.gov.in',
      tollFreeHelpline: '155388 / 1800 233 2200',
      isEligibleDemo: true
    },
    {
      id: 'GOV-SCHEME-04',
      name: "Chief Minister's Comprehensive Health Insurance (CMCHIS)",
      hindiName: 'मुख्यमंत्री समग्र स्वास्थ्य बीमा योजना (तमिलनाडु)',
      level: 'STATE',
      state: 'Tamil Nadu',
      maxCoverAmount: 500000,
      eligibleCategory: 'Resident families with annual income below ₹1,20,000',
      keyBenefits: [
        'Cashless coverage up to ₹5 Lakhs for 1,513 procedures',
        'Includes specialized diagnostic procedures and tertiary surgical care',
        'Dedicated district kiosk enrollment'
      ],
      requiredDocs: ['Smart Family Card (Ration Card)', 'Village Officer Income Certificate', 'Aadhaar Card'],
      applicationPortalUrl: 'https://cmchistn.com',
      tollFreeHelpline: '1800 425 3993',
      isEligibleDemo: false
    }
  ];

  // Private Insurance Policies & TPA Pre-Auth Data
  private insurancePolicies: InsurancePolicyClaim[] = [
    {
      id: 'INS-POL-01',
      insurerName: 'Star Health & Allied Insurance',
      policyNumber: 'STAR-COMP-2026-8910',
      sumInsured: 1000000,
      remainingSum: 820000,
      coPayPercent: 0,
      tpaName: 'Medi Assist Healthcare TPA',
      preAuthStatus: 'APPROVED',
      sanctionedAmount: 180000,
      claimReferenceNo: 'TPA-MED-849120',
      lastUpdated: '2026-09-15 11:20'
    },
    {
      id: 'INS-POL-02',
      insurerName: 'HDFC ERGO Health Optima Secure',
      policyNumber: 'HDFC-OPT-9481-2026',
      sumInsured: 1500000,
      remainingSum: 1500000,
      coPayPercent: 0,
      tpaName: 'In-House HDFC Health Desk',
      preAuthStatus: 'IN_REVIEW',
      sanctionedAmount: 0,
      claimReferenceNo: 'TPA-HDFC-102941',
      lastUpdated: '2026-09-16 16:45'
    },
    {
      id: 'INS-POL-03',
      insurerName: 'Care Health Supreme',
      policyNumber: 'CARE-SUP-5512-2026',
      sumInsured: 750000,
      remainingSum: 620000,
      coPayPercent: 10,
      tpaName: 'Raksha Health Insurance TPA',
      preAuthStatus: 'SETTLED',
      sanctionedAmount: 130000,
      claimReferenceNo: 'TPA-RAK-771829',
      lastUpdated: '2026-08-20 09:30'
    }
  ];

  // NGO & Charitable Trust Medical Grants
  private ngoGrants: NGOGrantProgram[] = [
    {
      id: 'NGO-TATA-01',
      orgName: 'Tata Memorial Trust & Allied Charities',
      programTitle: 'Lifeline Oncology Treatment Assistance',
      hindiTitle: 'टाटा ट्रस्ट ऑन्कोलॉजी कैंसर उपचार सहायता',
      focusArea: 'CANCER',
      maxGrantAmount: 300000,
      criteria: 'Economically weaker patients undergoing chemotherapy, radiation, or surgical resection',
      trustContact: 'aid@tatatrusts.org • +91 22 6665 8282',
      verificationOfficer: 'Dr. Anita Sen (Social Work Dept)',
      turnaroundTime: '48 to 72 Hours'
    },
    {
      id: 'NGO-ROTARY-02',
      orgName: 'Rotary International Club (District 3131)',
      programTitle: 'Save Little Hearts (Pediatric Cardiac Surgeries)',
      hindiTitle: 'रोटरी क्लब "नन्हें दिल" बाल हृदय शल्य चिकित्सा अनुदान',
      focusArea: 'CARDIAC_PEDIATRIC',
      maxGrantAmount: 250000,
      criteria: 'Children aged 0-14 suffering from Congenital Heart Defects (VSD/ASD/Tetralogy of Fallot)',
      trustContact: 'hearts@rotary3131.org • +91 20 2567 1144',
      verificationOfficer: 'Rtn. Vikramaditya Joshi',
      turnaroundTime: '24 Hours (Urgent Cardiac)'
    },
    {
      id: 'NGO-LIONS-03',
      orgName: 'Lions International Healthcare Foundation',
      programTitle: 'Subsidized Renal Dialysis & Corneal Sight Fund',
      hindiTitle: 'लायंस क्लब निःशुल्क डायलिसिस एवं कॉर्निया ट्रांसप्लांट राहत',
      focusArea: 'KIDNEY_DIALYSIS',
      maxGrantAmount: 150000,
      criteria: 'Chronic Kidney Disease Stage 4-5 patients requiring weekly maintenance hemodialysis',
      trustContact: 'healthcare@lionsclubsindia.org • +91 11 4152 7788',
      verificationOfficer: 'Harish Mehta (Trustee)',
      turnaroundTime: 'Immediate Voucher Issuance'
    },
    {
      id: 'NGO-BEINGHUMAN-04',
      orgName: 'Being Human The Salman Khan Foundation',
      programTitle: 'Critical Pediatric & Bone Marrow Healthcare Fund',
      hindiTitle: 'बीइंग ह्यूमन फाउंडेशन गंभीर बाल रोग व बोन मैरो सहायता',
      focusArea: 'GENERAL_BPL',
      maxGrantAmount: 200000,
      criteria: 'Children from underprivileged backgrounds requiring complex orthopedic and reconstructive surgery',
      trustContact: 'contact@beinghumanonline.com • +91 22 2642 8888',
      verificationOfficer: 'Pooja Nair (Medical Liaison)',
      turnaroundTime: '3 to 5 Days'
    }
  ];

  getGovernmentSchemes(): GovSchemeInfo[] {
    return [...this.govSchemes];
  }

  getInsurancePolicies(): InsurancePolicyClaim[] {
    return [...this.insurancePolicies];
  }

  simulateTPAApproval(policyNumber: string, requestedAmount: number): InsurancePolicyClaim {
    const policy = this.insurancePolicies.find(p => p.policyNumber === policyNumber) || this.insurancePolicies[0];
    const sanctioned = Math.min(requestedAmount, policy.remainingSum);
    policy.preAuthStatus = 'APPROVED';
    policy.sanctionedAmount = sanctioned;
    policy.remainingSum -= sanctioned;
    policy.claimReferenceNo = `TPA-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    policy.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    return { ...policy };
  }

  getNGOGrants(): NGOGrantProgram[] {
    return [...this.ngoGrants];
  }

  // Corporate CSR Healthcare Sponsorship Programs (Companies Act Sec 135)
  private csrPrograms: CSRCareProgram[] = [
    {
      id: 'CSR-TATA-01',
      corporateName: 'Tata Trusts & Tata Sons CSR',
      corporateLogoText: 'TATA',
      programTitle: 'Tata Medical Relief & Critical Oncology Corpus',
      hindiTitle: 'टाटा ट्रस्ट्स मेडिकल रिलीफ व ऑन्कोलॉजी कॉर्पस',
      corporateTier: 'FORTUNE_INDIA_500',
      annualCSRBudgetCrores: 35,
      maxGrantPerPatient: 350000,
      focusAreas: ['ONCOLOGY_CANCER', 'PEDIATRIC_CARDIAC', 'ORGAN_TRANSPLANT'],
      coPayEligibleWithPMJAY: true,
      criteria: 'BPL / EWS families, annual income < ₹3.5 Lakhs, covering advanced chemotherapy and bone marrow transplants',
      empanelledHospitals: ['Tata Memorial Hospital, Mumbai', 'CarePlus Multi-Specialty Hospital', 'KEM Hospital, Pune'],
      nodalContact: 'csr.health@tatatrusts.org • 1800-22-8282',
      avgApprovalHours: 24
    },
    {
      id: 'CSR-RELIANCE-02',
      corporateName: 'Reliance Foundation Mission Amrit CSR',
      corporateLogoText: 'RELIANCE',
      programTitle: 'Mission Amrit: Organ Transplant & Pediatric Surgery Fund',
      hindiTitle: 'रिलायंस फाउंडेशन मिशन अमृत: अंग प्रत्यारोपण व बाल शल्यचिकित्सा',
      corporateTier: 'FORTUNE_INDIA_500',
      annualCSRBudgetCrores: 50,
      maxGrantPerPatient: 450000,
      focusAreas: ['ORGAN_TRANSPLANT', 'PEDIATRIC_CARDIAC', 'RARE_DISEASE'],
      coPayEligibleWithPMJAY: true,
      criteria: 'Direct grant for liver/renal transplant co-payments and congenital heart defect corrections in infants',
      empanelledHospitals: ['Sir H.N. Reliance Foundation Hospital', 'Ruby Hall Clinic, Pune', 'CarePlus Hospital'],
      nodalContact: 'mission.amrit@reliancefoundation.org • 1800-419-8800',
      avgApprovalHours: 18
    },
    {
      id: 'CSR-INFOSYS-03',
      corporateName: 'Infosys Foundation Healthcare CSR',
      corporateLogoText: 'INFOSYS',
      programTitle: 'Aarogya Samriddhi Dialysis & Critical Renal Grant',
      hindiTitle: 'इन्फोसिस फाउंडेशन आरोग्य समृद्धि: डायलिसिस व रीनल ग्रांट',
      corporateTier: 'FORTUNE_INDIA_500',
      annualCSRBudgetCrores: 22,
      maxGrantPerPatient: 250000,
      focusAreas: ['KIDNEY_DIALYSIS', 'RURAL_TRAUMA'],
      coPayEligibleWithPMJAY: true,
      criteria: 'End-Stage Renal Disease (ESRD) patients needing arteriovenous (AV) fistula and long-term hemodialysis cycles',
      empanelledHospitals: ['CarePlus Multi-Specialty', 'Jayadeva Institute', 'Manipal Hospitals'],
      nodalContact: 'healthcare.csr@infosys.com • 080-2852-0261',
      avgApprovalHours: 12
    },
    {
      id: 'CSR-ADANI-04',
      corporateName: 'Adani Foundation SuSwasthya CSR',
      corporateLogoText: 'ADANI',
      programTitle: 'SuSwasthya Emergency Trauma & Critical Neonatal Fund',
      hindiTitle: 'अदाणी फाउंडेशन सुस्वास्थ्य: इमरजेंसी ट्रॉमा व नवजात शिशु देखभाल',
      corporateTier: 'FORTUNE_INDIA_500',
      annualCSRBudgetCrores: 18,
      maxGrantPerPatient: 200000,
      focusAreas: ['RURAL_TRAUMA', 'PEDIATRIC_CARDIAC'],
      coPayEligibleWithPMJAY: true,
      criteria: 'Emergency trauma resuscitation, pediatric NICU admissions, and acute orthopedic poly-trauma stabilization',
      empanelledHospitals: ['CarePlus Hospital', 'GAIMS Bhuj', 'Apollo Hospitals'],
      nodalContact: 'suswasthya@adanifoundation.org • 1800-233-0000',
      avgApprovalHours: 8
    },
    {
      id: 'CSR-AZIMPREMJI-05',
      corporateName: 'Azim Premji Philanthropic Initiatives',
      corporateLogoText: 'WIPRO-APPI',
      programTitle: 'Rare Diseases & Lifelong Pediatric Care Corpus',
      hindiTitle: 'अजीम प्रेमजी फाउंडेशन: दुर्लभ रोग व आजीवन बाल स्वास्थ्य कोष',
      corporateTier: 'GLOBAL_CORP',
      annualCSRBudgetCrores: 40,
      maxGrantPerPatient: 500000,
      focusAreas: ['RARE_DISEASE', 'ONCOLOGY_CANCER'],
      coPayEligibleWithPMJAY: true,
      criteria: 'Rare lysosomal storage disorders, spinal muscular atrophy (SMA), and pediatric neuroblastoma treatment',
      empanelledHospitals: ['NIMHANS', 'CarePlus Hospital', 'AIIMS New Delhi'],
      nodalContact: 'grants@azimpremjifoundation.org • 080-6614-4900',
      avgApprovalHours: 24
    }
  ];

  // In-memory active CSR applications
  private csrApplications: CSRApplication[] = [
    {
      id: 'CSR-APP-001',
      referenceNo: 'CSR-2026-TATA-9102',
      patientName: 'Ankit Patel',
      patientAbha: '14-2026-9812-4401',
      corporateId: 'CSR-TATA-01',
      corporateName: 'Tata Trusts Medical Relief',
      treatmentName: 'Coronary Angioplasty with Drug-Eluting Stents',
      hospitalName: 'CarePlus Tertiary Heart Hospital',
      totalHospitalBill: 220000,
      pmjayOrInsuranceCover: 160000,
      requestedCSRAmount: 60000,
      sanctionedAmount: 60000,
      status: 'CSR_APPROVED',
      submissionDate: '2026-02-28',
      sanctionDate: '2026-03-01',
      utrNumber: 'UTR-HDFC-9912048129',
      corporateReviewNotes: 'Pre-auth approved under Section 135 CSR Healthcare Corpus. Direct disbursement sanctioned to hospital billing desk.'
    }
  ];

  getCSRPrograms(): CSRCareProgram[] {
    return [...this.csrPrograms];
  }

  getCSRApplications(): CSRApplication[] {
    return [...this.csrApplications];
  }

  submitCSRApplication(app: {
    patientName: string;
    patientAbha: string;
    corporateId: string;
    corporateName: string;
    treatmentName: string;
    hospitalName: string;
    totalHospitalBill: number;
    pmjayOrInsuranceCover: number;
    requestedCSRAmount: number;
  }): CSRApplication {
    const ref = `CSR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: CSRApplication = {
      id: `CSR-APP-${Math.floor(100 + Math.random() * 900)}`,
      referenceNo: ref,
      patientName: app.patientName,
      patientAbha: app.patientAbha,
      corporateId: app.corporateId,
      corporateName: app.corporateName,
      treatmentName: app.treatmentName,
      hospitalName: app.hospitalName,
      totalHospitalBill: app.totalHospitalBill,
      pmjayOrInsuranceCover: app.pmjayOrInsuranceCover,
      requestedCSRAmount: app.requestedCSRAmount,
      sanctionedAmount: app.requestedCSRAmount,
      status: 'CSR_APPROVED',
      submissionDate: new Date().toISOString().split('T')[0],
      sanctionDate: new Date().toISOString().split('T')[0],
      utrNumber: `UTR-CSR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      corporateReviewNotes: `Fast-track approved under Corporate Social Responsibility (Sec 135). Amount credited to ${app.hospitalName} billing desk.`
    };

    this.csrApplications.unshift(newApp);
    this.addAuditLog({
      actor: app.patientName,
      actorRole: 'PATIENT',
      action: 'CSR_SPONSORSHIP_SANCTION',
      resourceTarget: newApp.referenceNo,
      details: `CSR grant of ₹${app.requestedCSRAmount.toLocaleString()} sanctioned by ${app.corporateName} for ${app.treatmentName} at ${app.hospitalName}.`,
      abdmComplianceTag: 'ABDM-M2-CSR-SPONSORSHIP'
    });
    this.notify('csr');
    return newApp;
  }


  // Real-time Pub/Sub Event Bus
  private listeners: Map<string, Set<() => void>> = new Map();

  subscribe(channel: string, callback: () => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);
    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  notify(channel: string): void {
    const subs = this.listeners.get(channel);
    if (subs) {
      subs.forEach(cb => {
        try { cb(); } catch (e) { console.error(e); }
      });
    }
  }

  // Master Audit Trail
  private auditLogs: MasterAuditLogEntry[] = [
    {
      id: 'AUDIT-LOG-101',
      timestamp: '2026-09-17 08:30',
      actor: 'Agent-OPDQueueSync',
      actorRole: 'AGENT_SWARM',
      action: 'QUEUE_ADVANCE',
      resourceTarget: 'HOSP-01/Cardiology',
      details: 'Advanced Token #13 to #14. Recalculated dynamic wait time to 16 mins.',
      abdmComplianceTag: 'ABDM-M2-TELEMETRY'
    },
    {
      id: 'AUDIT-LOG-102',
      timestamp: '2026-09-17 08:45',
      actor: 'Agent-BedTelemetry',
      actorRole: 'AGENT_SWARM',
      action: 'ICU_CAPACITY_PING',
      resourceTarget: 'HOSP-01/ICU',
      details: 'ICU available beds updated to 7/32 (Occupancy: 78.1%). Safe threshold.',
      abdmComplianceTag: 'ABDM-M1-FACILITY'
    },
    {
      id: 'AUDIT-LOG-103',
      timestamp: '2026-09-17 08:52',
      actor: 'Agent-BloodBankRadar',
      actorRole: 'AGENT_SWARM',
      action: 'CRITICAL_STOCK_SCAN',
      resourceTarget: 'HOSP-01/BloodBank',
      details: 'O- Negative stock at 3 units (< 5 units threshold). Emergency broadcast initiated.',
      abdmComplianceTag: 'ABDM-M3-BLOOD-RESERVE'
    }
  ];

  getAuditLogs(): MasterAuditLogEntry[] {
    return [...this.auditLogs];
  }

  addAuditLog(entry: Omit<MasterAuditLogEntry, 'id' | 'timestamp'>): void {
    const newLog: MasterAuditLogEntry = {
      ...entry,
      id: `AUDIT-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
    this.notify('audit');
  }

  // Register New Hospital
  registerHospital(form: HospitalRegistrationForm): Hospital {
    const newHosp: Hospital = {
      id: `HOSP-${Math.floor(10 + Math.random() * 90)}`,
      name: form.name,
      city: form.city,
      state: form.state,
      type: form.type,
      distanceKm: Math.round((2 + Math.random() * 8) * 10) / 10,
      rating: 4.8,
      chikitsaCareScore: 92,
      acceptedGovSchemes: form.acceptedGovSchemes.length > 0 ? form.acceptedGovSchemes : ['Ayushman Bharat PM-JAY'],
      emergency24x7: form.emergency24x7,
      contactNumber: form.contactNumber,
      mapsCoord: { lat: 18.5204 + (Math.random() - 0.5) * 0.05, lng: 73.8567 + (Math.random() - 0.5) * 0.05 },
      opdDepartments: form.opdDepartments.length > 0 ? form.opdDepartments : ['General Medicine', 'Cardiology', 'Orthopedics'],
      bedTelemetry: {
        icuTotal: form.icuTotal,
        icuAvailable: Math.max(1, Math.floor(form.icuTotal * 0.25)),
        ventilatorTotal: form.ventilatorTotal,
        ventilatorAvailable: Math.max(1, Math.floor(form.ventilatorTotal * 0.3)),
        oxygenBedsTotal: form.oxygenBedsTotal,
        oxygenBedsAvailable: Math.max(2, Math.floor(form.oxygenBedsTotal * 0.35)),
        generalBedsTotal: form.generalBedsTotal,
        generalBedsAvailable: Math.max(5, Math.floor(form.generalBedsTotal * 0.4)),
        lastTelemetryPing: 'Just registered'
      },
      bloodBankStock: form.bloodBankInHouse ? [
        { group: 'A+', units: Math.floor(form.bloodUnitsInitial * 0.25), isCriticallyLow: false },
        { group: 'A-', units: 4, isCriticallyLow: false },
        { group: 'B+', units: Math.floor(form.bloodUnitsInitial * 0.3), isCriticallyLow: false },
        { group: 'B-', units: 3, isCriticallyLow: true },
        { group: 'AB+', units: 10, isCriticallyLow: false },
        { group: 'AB-', units: 2, isCriticallyLow: true },
        { group: 'O+', units: Math.floor(form.bloodUnitsInitial * 0.35), isCriticallyLow: false },
        { group: 'O-', units: 2, isCriticallyLow: true }
      ] : []
    };

    this.hospitals.unshift(newHosp);
    this.addAuditLog({
      actor: form.nodalOfficerName || 'Hospital Admin',
      actorRole: 'HOSPITAL_ADMIN',
      action: 'HOSPITAL_REGISTRATION',
      resourceTarget: newHosp.id,
      details: `Registered ${newHosp.name} (${form.rohiniId}) with ${form.generalBedsTotal} beds, ${form.icuTotal} ICU beds under ${form.nabhLevel}.`,
      abdmComplianceTag: 'ABDM-M1-FACILITY-REG'
    });
    this.notify('hospitals');
    return newHosp;
  }

  // Update Bed Telemetry (called by BedTelemetryAgent)
  updateHospitalBedTelemetry(hospitalId: string, delta: Partial<HospitalBedTelemetry>): void {
    const hosp = this.hospitals.find(h => h.id === hospitalId) || this.hospitals[0];
    if (hosp) {
      hosp.bedTelemetry = {
        ...hosp.bedTelemetry,
        ...delta,
        lastTelemetryPing: 'Live Telemetry (Agent Pinned)'
      };
      this.notify('telemetry');
    }
  }

  // Update Blood Stock (called by BloodBankRadarAgent)
  updateBloodStock(hospitalId: string, group: string, deltaUnits: number): void {
    const hosp = this.hospitals.find(h => h.id === hospitalId) || this.hospitals[0];
    if (hosp && hosp.bloodBankStock) {
      const item = hosp.bloodBankStock.find(b => b.group === group);
      if (item) {
        item.units = Math.max(0, item.units + deltaUnits);
        item.isCriticallyLow = item.units < 5;
        this.notify('blood');
      }
    }
  }

  // Register New Patient with OTP Verification
  registerPatient(form: PatientRegistrationForm): User {
    const abhaNum = `14-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanName = form.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const abhaAddr = `${cleanName}@abdm`;
    const newUserId = `USR-PAT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: newUserId,
      name: form.fullName,
      email: form.email,
      phone: form.mobile,
      role: 'PATIENT',
      abhaAddress: form.autoCreateABHA ? abhaAddr : undefined
    };

    if (form.autoCreateABHA) {
      this.abhaProfile = {
        abhaNumber: abhaNum,
        abhaAddress: abhaAddr,
        fullName: form.fullName,
        dob: form.dob || '1998-05-15',
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        mobile: form.mobile,
        address: `${form.city}, ${form.state} - India`,
        kycVerified: true,
        linkedFacilitiesCount: 1,
        qrPayload: `https://healthid.ndhm.gov.in/verify?abha=${abhaNum}`
      };
    }

    this.demoUsers.unshift(newUser);
    this.currentUser = newUser;

    this.addAuditLog({
      actor: form.fullName,
      actorRole: 'PATIENT',
      action: 'PATIENT_OTP_REGISTRATION',
      resourceTarget: newUserId,
      details: `Registered new patient ${form.fullName} (Email: ${form.email}, Mobile: ${form.mobile}). ABHA: ${form.autoCreateABHA ? abhaNum : 'N/A'}. OTP verified.`,
      abdmComplianceTag: 'ABDM-M1-PATIENT-KYC'
    });

    this.notify('patients');
    return newUser;
  }

  // Register New Doctor with NMC / Email OTP Verification
  registerDoctor(form: DoctorRegistrationForm): User {
    const newUserId = `USR-DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const docProfileId = `DOC-NMC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const formattedName = form.fullName.startsWith('Dr.') ? form.fullName : `Dr. ${form.fullName}`;

    const newDoctorProfile: DoctorProfile = {
      id: docProfileId,
      name: formattedName,
      email: form.email,
      phone: form.mobile,
      nmcRegistrationId: form.nmcRegistrationId,
      specialty: form.specialty,
      qualifications: form.qualifications,
      experienceYears: form.experienceYears,
      hospitalAffiliation: form.hospitalAffiliation || 'CarePlus Multi-Specialty Hospital',
      department: form.specialty,
      isNmcVerified: true,
      digitalSignatureId: `DSIG-NMC-${Math.floor(10000 + Math.random() * 90000)}-VERIF`
    };

    const newUser: User = {
      id: newUserId,
      name: formattedName,
      email: form.email,
      phone: form.mobile,
      role: 'DOCTOR',
      hospitalId: 'HOSP-01'
    };

    this.registeredDoctors.unshift(newDoctorProfile);
    this.demoUsers.unshift(newUser);
    this.currentUser = newUser;

    this.addAuditLog({
      actor: formattedName,
      actorRole: 'DOCTOR',
      action: 'DOCTOR_NMC_REGISTRATION',
      resourceTarget: docProfileId,
      details: `Registered medical practitioner ${formattedName} (NMC Reg: ${form.nmcRegistrationId}, Specialty: ${form.specialty}). OTP & NMC credentials verified.`,
      abdmComplianceTag: 'ABDM-M1-HPR-DOCTOR'
    });

    this.notify('doctors');
    return newUser;
  }

  getRegisteredDoctors(): DoctorProfile[] {
    return this.registeredDoctors;
  }

  getActiveDoctor(): DoctorProfile {
    if (this.currentUser.role === 'DOCTOR') {
      const found = this.registeredDoctors.find(
        d => d.email === this.currentUser.email || d.name.toLowerCase() === this.currentUser.name.toLowerCase()
      );
      if (found) return found;
    }
    return this.registeredDoctors[0];
  }
}

export const db = new ChikitsaDatabase();

