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
  NGOGrantProgram
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
      ]
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
      ]
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
      ]
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
}

export const db = new ChikitsaDatabase();
