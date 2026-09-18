export const upHospitals = [
  // ==========================================
  // 🏛️ UTTAR PRADESH GOVERNMENT APEX HOSPITALS
  // ==========================================
  {
    id: 'HOSP-UP-01',
    name: 'Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGIMS)',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 2.4,
    rating: 4.9,
    chikitsaCareScore: 99,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi (RAN)',
      'CGHS & State Employee Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 522 266 8004',
    mapsCoord: { lat: 26.7460, lng: 80.9385 },
    opdDepartments: [
      'Emergency Trauma',
      'Cardiology & CTVS',
      'Neurosurgery',
      'Gastroenterology & Hepatology',
      'Medical Genetics',
      'Renal Transplant & Nephrology',
      'Endocrinology',
      'Hematology & Bone Marrow'
    ],
    bedTelemetry: {
      icuTotal: 96,
      icuAvailable: 24,
      ventilatorTotal: 52,
      ventilatorAvailable: 14,
      oxygenBedsTotal: 290,
      oxygenBedsAvailable: 78,
      generalBedsTotal: 1400,
      generalBedsAvailable: 240,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 72, isCriticallyLow: false },
      { group: 'A-', units: 15, isCriticallyLow: false },
      { group: 'B+', units: 88, isCriticallyLow: false },
      { group: 'B-', units: 14, isCriticallyLow: false },
      { group: 'AB+', units: 34, isCriticallyLow: false },
      { group: 'AB-', units: 9, isCriticallyLow: false },
      { group: 'O+', units: 110, isCriticallyLow: false },
      { group: 'O-', units: 18, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Apex Autonomous Institute',
      opdConsultFee: 20,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Subsidized Apex Autonomous Institute'
    }
  },
  {
    id: 'HOSP-UP-02',
    name: "King George's Medical University (KGMU) & Shatabdi Hospital",
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 3.1,
    rating: 4.8,
    chikitsaCareScore: 98,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi (RAN)',
      'National Health Mission UP'
    ],
    emergency24x7: true,
    contactNumber: '+91 522 225 7540',
    mapsCoord: { lat: 26.8687, lng: 80.9168 },
    opdDepartments: [
      'Trauma Surgery & Resuscitation',
      'Cardiovascular & Thoracic Surgery',
      'General Medicine',
      'Orthopedics & Joint Care',
      'Pediatrics & Neonatology',
      'Pulmonary Critical Care',
      'Ophthalmology'
    ],
    bedTelemetry: {
      icuTotal: 130,
      icuAvailable: 32,
      ventilatorTotal: 68,
      ventilatorAvailable: 18,
      oxygenBedsTotal: 480,
      oxygenBedsAvailable: 120,
      generalBedsTotal: 4200,
      generalBedsAvailable: 610,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 110, isCriticallyLow: false },
      { group: 'A-', units: 22, isCriticallyLow: false },
      { group: 'B+', units: 135, isCriticallyLow: false },
      { group: 'B-', units: 19, isCriticallyLow: false },
      { group: 'AB+', units: 48, isCriticallyLow: false },
      { group: 'AB-', units: 11, isCriticallyLow: false },
      { group: 'O+', units: 160, isCriticallyLow: false },
      { group: 'O-', units: 25, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Apex University Care (4,200 Beds)',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 100% Free Government Hospital'
    }
  },
  {
    id: 'HOSP-UP-03',
    name: 'Sir Sunderlal Hospital, Institute of Medical Sciences (IMS-BHU)',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 4.2,
    rating: 4.9,
    chikitsaCareScore: 98,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi (RAN)',
      'Central Government Health Scheme (CGHS)'
    ],
    emergency24x7: true,
    contactNumber: '+91 542 236 9031',
    mapsCoord: { lat: 25.2750, lng: 82.9995 },
    opdDepartments: [
      'Apex Trauma Resuscitation',
      'Cardiology',
      'Surgical Oncology',
      'Nephrology & Dialysis',
      'Ayurveda & Integrative Medicine',
      'Neurology',
      'Pediatrics'
    ],
    bedTelemetry: {
      icuTotal: 88,
      icuAvailable: 22,
      ventilatorTotal: 44,
      ventilatorAvailable: 12,
      oxygenBedsTotal: 340,
      oxygenBedsAvailable: 88,
      generalBedsTotal: 1850,
      generalBedsAvailable: 310,
      lastTelemetryPing: '2 mins ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 76, isCriticallyLow: false },
      { group: 'A-', units: 16, isCriticallyLow: false },
      { group: 'B+', units: 92, isCriticallyLow: false },
      { group: 'B-', units: 12, isCriticallyLow: false },
      { group: 'AB+', units: 36, isCriticallyLow: false },
      { group: 'AB-', units: 8, isCriticallyLow: false },
      { group: 'O+', units: 120, isCriticallyLow: false },
      { group: 'O-', units: 19, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Central University Apex Hospital',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free Central Government BHU Care'
    }
  },
  {
    id: 'HOSP-UP-04',
    name: 'All India Institute of Medical Sciences (AIIMS) Gorakhpur',
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 5.0,
    rating: 4.9,
    chikitsaCareScore: 97,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi'
    ],
    emergency24x7: true,
    contactNumber: '+91 551 220 5501',
    mapsCoord: { lat: 26.7588, lng: 83.4331 },
    opdDepartments: [
      'Emergency & Trauma Care',
      'Cardiology',
      'Pulmonology & Respiratory',
      'Pediatric Critical Care',
      'Orthopedics',
      'Obstetrics & Gynecology'
    ],
    bedTelemetry: {
      icuTotal: 80,
      icuAvailable: 21,
      ventilatorTotal: 40,
      ventilatorAvailable: 11,
      oxygenBedsTotal: 230,
      oxygenBedsAvailable: 68,
      generalBedsTotal: 960,
      generalBedsAvailable: 190,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 58, isCriticallyLow: false },
      { group: 'A-', units: 12, isCriticallyLow: false },
      { group: 'B+', units: 70, isCriticallyLow: false },
      { group: 'B-', units: 11, isCriticallyLow: false },
      { group: 'AB+', units: 28, isCriticallyLow: false },
      { group: 'AB-', units: 7, isCriticallyLow: false },
      { group: 'O+', units: 88, isCriticallyLow: false },
      { group: 'O-', units: 14, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Central Government AIIMS Institute',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free Central Government AIIMS'
    }
  },
  {
    id: 'HOSP-UP-05',
    name: 'Dr. Ram Manohar Lohia Institute of Medical Sciences (RMLIMS)',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 3.8,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi'
    ],
    emergency24x7: true,
    contactNumber: '+91 522 491 8504',
    mapsCoord: { lat: 26.8672, lng: 81.0028 },
    opdDepartments: [
      'Emergency Trauma',
      'Cardiology',
      'Surgical Oncology',
      'Radiation Oncology',
      'Neurology',
      'Urology & Renal Care'
    ],
    bedTelemetry: {
      icuTotal: 65,
      icuAvailable: 16,
      ventilatorTotal: 32,
      ventilatorAvailable: 8,
      oxygenBedsTotal: 200,
      oxygenBedsAvailable: 58,
      generalBedsTotal: 1250,
      generalBedsAvailable: 220,
      lastTelemetryPing: '1 min ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 48, isCriticallyLow: false },
      { group: 'A-', units: 9, isCriticallyLow: false },
      { group: 'B+', units: 62, isCriticallyLow: false },
      { group: 'B-', units: 10, isCriticallyLow: false },
      { group: 'AB+', units: 24, isCriticallyLow: false },
      { group: 'AB-', units: 6, isCriticallyLow: false },
      { group: 'O+', units: 78, isCriticallyLow: false },
      { group: 'O-', units: 12, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free State Government Super Specialty',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free State Government Super Specialty'
    }
  },
  {
    id: 'HOSP-UP-06',
    name: 'Lala Lajpat Rai (LLR / Hallet) Hospital & GSVM Medical College',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 3.5,
    rating: 4.7,
    chikitsaCareScore: 94,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP'
    ],
    emergency24x7: true,
    contactNumber: '+91 512 253 5483',
    mapsCoord: { lat: 26.4880, lng: 80.2970 },
    opdDepartments: [
      'Emergency Resuscitation & Trauma',
      'Cardiology',
      'General Medicine',
      'Orthopedics',
      'Pediatrics',
      'Obstetrics & Gynecology'
    ],
    bedTelemetry: {
      icuTotal: 68,
      icuAvailable: 15,
      ventilatorTotal: 34,
      ventilatorAvailable: 8,
      oxygenBedsTotal: 220,
      oxygenBedsAvailable: 64,
      generalBedsTotal: 1650,
      generalBedsAvailable: 280,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 52, isCriticallyLow: false },
      { group: 'A-', units: 10, isCriticallyLow: false },
      { group: 'B+', units: 66, isCriticallyLow: false },
      { group: 'B-', units: 11, isCriticallyLow: false },
      { group: 'AB+', units: 26, isCriticallyLow: false },
      { group: 'AB-', units: 7, isCriticallyLow: false },
      { group: 'O+', units: 84, isCriticallyLow: false },
      { group: 'O-', units: 13, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Government GSVM Hospital',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free GSVM Government Care'
    }
  },
  {
    id: 'HOSP-UP-07',
    name: 'Swaroop Rani Nehru (SRN) Hospital & MLN Medical College',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 2.9,
    rating: 4.8,
    chikitsaCareScore: 95,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Rashtriya Arogya Nidhi'
    ],
    emergency24x7: true,
    contactNumber: '+91 532 225 6776',
    mapsCoord: { lat: 25.4520, lng: 81.8540 },
    opdDepartments: [
      'Trauma Emergency',
      'Cardiology',
      'Neurosurgery',
      'Plastic Surgery',
      'Pediatrics',
      'General Medicine'
    ],
    bedTelemetry: {
      icuTotal: 58,
      icuAvailable: 14,
      ventilatorTotal: 29,
      ventilatorAvailable: 7,
      oxygenBedsTotal: 190,
      oxygenBedsAvailable: 52,
      generalBedsTotal: 1400,
      generalBedsAvailable: 230,
      lastTelemetryPing: '3 mins ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 44, isCriticallyLow: false },
      { group: 'A-', units: 9, isCriticallyLow: false },
      { group: 'B+', units: 58, isCriticallyLow: false },
      { group: 'B-', units: 8, isCriticallyLow: false },
      { group: 'AB+', units: 22, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 72, isCriticallyLow: false },
      { group: 'O-', units: 11, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Prayagraj Apex Government Hospital',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free Prayagraj Apex Government Hospital'
    }
  },
  {
    id: 'HOSP-UP-08',
    name: 'Sarojini Naidu Medical College (SNMC) & Hospital',
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 3.2,
    rating: 4.6,
    chikitsaCareScore: 93,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP'
    ],
    emergency24x7: true,
    contactNumber: '+91 562 226 0353',
    mapsCoord: { lat: 27.1820, lng: 78.0060 },
    opdDepartments: [
      'Emergency Trauma',
      'General Medicine',
      'Cardiology',
      'Respiratory Medicine',
      'Ophthalmology',
      'Surgery'
    ],
    bedTelemetry: {
      icuTotal: 50,
      icuAvailable: 12,
      ventilatorTotal: 25,
      ventilatorAvailable: 6,
      oxygenBedsTotal: 170,
      oxygenBedsAvailable: 45,
      generalBedsTotal: 1150,
      generalBedsAvailable: 195,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 38, isCriticallyLow: false },
      { group: 'A-', units: 8, isCriticallyLow: false },
      { group: 'B+', units: 48, isCriticallyLow: false },
      { group: 'B-', units: 7, isCriticallyLow: false },
      { group: 'AB+', units: 20, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 64, isCriticallyLow: false },
      { group: 'O-', units: 10, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Historic Medical College Hospital',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free SNMC Government Hospital'
    }
  },
  {
    id: 'HOSP-UP-09',
    name: 'Jawaharlal Nehru Medical College & Hospital (JNMC, AMU)',
    city: 'Aligarh',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 4.5,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Rashtriya Arogya Nidhi',
      'Mukhyamantri Jan Arogya UP'
    ],
    emergency24x7: true,
    contactNumber: '+91 571 270 0920',
    mapsCoord: { lat: 27.9150, lng: 78.0770 },
    opdDepartments: [
      'Emergency & Trauma Resuscitation',
      'Cardiothoracic Surgery',
      'Pediatrics',
      'Radiotherapy & Oncology',
      'Nephrology'
    ],
    bedTelemetry: {
      icuTotal: 60,
      icuAvailable: 15,
      ventilatorTotal: 30,
      ventilatorAvailable: 8,
      oxygenBedsTotal: 200,
      oxygenBedsAvailable: 55,
      generalBedsTotal: 1250,
      generalBedsAvailable: 210,
      lastTelemetryPing: '2 mins ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 45, isCriticallyLow: false },
      { group: 'A-', units: 10, isCriticallyLow: false },
      { group: 'B+', units: 56, isCriticallyLow: false },
      { group: 'B-', units: 9, isCriticallyLow: false },
      { group: 'AB+', units: 24, isCriticallyLow: false },
      { group: 'AB-', units: 6, isCriticallyLow: false },
      { group: 'O+', units: 75, isCriticallyLow: false },
      { group: 'O-', units: 12, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Central University JNMC AMU Care',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free Central University JNMC AMU Hospital'
    }
  },
  {
    id: 'HOSP-UP-10',
    name: 'District Combined Hospital (Sanyukt Zila Chikitsalaya), Sector 39',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'GOVERNMENT',
    distanceKm: 2.1,
    rating: 4.7,
    chikitsaCareScore: 94,
    acceptedGovSchemes: [
      '100% Free Public Care',
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'National Health Mission'
    ],
    emergency24x7: true,
    contactNumber: '+91 120 245 0000',
    mapsCoord: { lat: 28.5670, lng: 77.3480 },
    opdDepartments: [
      'Emergency Trauma',
      'General Medicine',
      'Orthopedics',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'Hemodialysis Unit'
    ],
    bedTelemetry: {
      icuTotal: 45,
      icuAvailable: 11,
      ventilatorTotal: 22,
      ventilatorAvailable: 6,
      oxygenBedsTotal: 150,
      oxygenBedsAvailable: 42,
      generalBedsTotal: 440,
      generalBedsAvailable: 80,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 35, isCriticallyLow: false },
      { group: 'A-', units: 7, isCriticallyLow: false },
      { group: 'B+', units: 44, isCriticallyLow: false },
      { group: 'B-', units: 6, isCriticallyLow: false },
      { group: 'AB+', units: 18, isCriticallyLow: false },
      { group: 'AB-', units: 4, isCriticallyLow: true },
      { group: 'O+', units: 58, isCriticallyLow: false },
      { group: 'O-', units: 9, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'FREE_PUBLIC',
      tierLabel: '100% Free Public Government District Hospital',
      opdConsultFee: 10,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 0,
      costScore: 99,
      approxTreatmentRange: '₹0 Free NCR Government Hospital'
    }
  },

  // ===================================================
  // 🏥 UTTAR PRADESH PREMIER PRIVATE & CHARITABLE TRUST
  // ===================================================
  {
    id: 'HOSP-UP-11',
    name: 'Medanta Hospital Lucknow (Super Specialty)',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 3.2,
    rating: 4.9,
    chikitsaCareScore: 99,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS & ECHS',
      'Tata Trusts Empanelled',
      'All Major TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 522 450 5050',
    mapsCoord: { lat: 26.7794, lng: 80.9892 },
    opdDepartments: [
      'Heart Institute & Interventional Cardiology',
      'Cancer Institute (Medical, Surgical, Radiation)',
      'Neurosciences & Spine Surgery',
      'Liver & Renal Multi-Organ Transplant',
      'Orthopedics & Joint Replacement',
      'Critical Care Medicine'
    ],
    bedTelemetry: {
      icuTotal: 115,
      icuAvailable: 28,
      ventilatorTotal: 58,
      ventilatorAvailable: 15,
      oxygenBedsTotal: 290,
      oxygenBedsAvailable: 85,
      generalBedsTotal: 980,
      generalBedsAvailable: 165,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 82, isCriticallyLow: false },
      { group: 'A-', units: 18, isCriticallyLow: false },
      { group: 'B+', units: 96, isCriticallyLow: false },
      { group: 'B-', units: 15, isCriticallyLow: false },
      { group: 'AB+', units: 42, isCriticallyLow: false },
      { group: 'AB-', units: 10, isCriticallyLow: false },
      { group: 'O+', units: 125, isCriticallyLow: false },
      { group: 'O-', units: 20, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY 100% Cashless / Quaternary Care Center',
      opdConsultFee: 800,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 10,
      costScore: 86,
      approxTreatmentRange: '100% Cashless via PM-JAY / Private Quaternary Care'
    }
  },
  {
    id: 'HOSP-UP-12',
    name: 'Apollo Medics Super Speciality Hospital',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 4.1,
    rating: 4.8,
    chikitsaCareScore: 97,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 522 678 8888',
    mapsCoord: { lat: 26.7930, lng: 80.8990 },
    opdDepartments: [
      'Emergency 24x7 & Trauma',
      'Cardiology & Cardiac Surgery',
      'Comprehensive Oncology',
      'Gastroenterology',
      'Nephrology & Urology',
      'Neurosurgery'
    ],
    bedTelemetry: {
      icuTotal: 72,
      icuAvailable: 18,
      ventilatorTotal: 36,
      ventilatorAvailable: 9,
      oxygenBedsTotal: 170,
      oxygenBedsAvailable: 48,
      generalBedsTotal: 330,
      generalBedsAvailable: 65,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 50, isCriticallyLow: false },
      { group: 'A-', units: 11, isCriticallyLow: false },
      { group: 'B+', units: 62, isCriticallyLow: false },
      { group: 'B-', units: 9, isCriticallyLow: false },
      { group: 'AB+', units: 25, isCriticallyLow: false },
      { group: 'AB-', units: 6, isCriticallyLow: false },
      { group: 'O+', units: 80, isCriticallyLow: false },
      { group: 'O-', units: 12, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY 100% Cashless / Apollo Quaternary Care',
      opdConsultFee: 750,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 84,
      approxTreatmentRange: '100% Cashless via PM-JAY / Moderate Private'
    }
  },
  {
    id: 'HOSP-UP-13',
    name: 'Fortis Hospital Noida, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 2.8,
    rating: 4.9,
    chikitsaCareScore: 98,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'CGHS',
      'ECHS',
      'All Major TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 120 430 0222',
    mapsCoord: { lat: 28.6186, lng: 77.3725 },
    opdDepartments: [
      'Cardiology & Cardiac Surgery',
      'Orthopedics & Joint Replacement',
      'Neurosciences & Spine',
      'Kidney & Liver Transplant',
      'Medical & Surgical Oncology',
      'Emergency Trauma'
    ],
    bedTelemetry: {
      icuTotal: 60,
      icuAvailable: 15,
      ventilatorTotal: 30,
      ventilatorAvailable: 8,
      oxygenBedsTotal: 150,
      oxygenBedsAvailable: 44,
      generalBedsTotal: 290,
      generalBedsAvailable: 58,
      lastTelemetryPing: '1 min ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 48, isCriticallyLow: false },
      { group: 'A-', units: 10, isCriticallyLow: false },
      { group: 'B+', units: 58, isCriticallyLow: false },
      { group: 'B-', units: 8, isCriticallyLow: false },
      { group: 'AB+', units: 24, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 76, isCriticallyLow: false },
      { group: 'O-', units: 11, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY 100% Cashless / NABH Super Specialty',
      opdConsultFee: 850,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 84,
      approxTreatmentRange: '100% Cashless via PM-JAY / NABH Accredited Private'
    }
  },
  {
    id: 'HOSP-UP-14',
    name: 'Jaypee Hospital, Sector 128',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 4.8,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'CGHS',
      'ECHS',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 120 412 2222',
    mapsCoord: { lat: 28.5175, lng: 77.3735 },
    opdDepartments: [
      'Multi-Organ Transplant',
      'Cardiac Sciences',
      'Robotic Surgery',
      'Pediatric Super Specialties',
      'Interventional Radiology'
    ],
    bedTelemetry: {
      icuTotal: 75,
      icuAvailable: 19,
      ventilatorTotal: 38,
      ventilatorAvailable: 10,
      oxygenBedsTotal: 180,
      oxygenBedsAvailable: 50,
      generalBedsTotal: 504,
      generalBedsAvailable: 95,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 55, isCriticallyLow: false },
      { group: 'A-', units: 12, isCriticallyLow: false },
      { group: 'B+', units: 68, isCriticallyLow: false },
      { group: 'B-', units: 10, isCriticallyLow: false },
      { group: 'AB+', units: 28, isCriticallyLow: false },
      { group: 'AB-', units: 6, isCriticallyLow: false },
      { group: 'O+', units: 88, isCriticallyLow: false },
      { group: 'O-', units: 13, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Quaternary Care Center',
      opdConsultFee: 750,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 85,
      approxTreatmentRange: 'PM-JAY Cashless / Quaternary Care Center'
    }
  },
  {
    id: 'HOSP-UP-15',
    name: 'Yashoda Super Speciality Hospital, Kaushambi',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 3.9,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'ECHS',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 120 418 1900',
    mapsCoord: { lat: 28.6460, lng: 77.3250 },
    opdDepartments: [
      'Heart Center & Interventional Cath',
      'Neurosciences & Neurosurgery',
      'Pulmonology & Critical Care',
      'Medical Oncology',
      'Nephrology & Dialysis'
    ],
    bedTelemetry: {
      icuTotal: 65,
      icuAvailable: 16,
      ventilatorTotal: 32,
      ventilatorAvailable: 8,
      oxygenBedsTotal: 160,
      oxygenBedsAvailable: 45,
      generalBedsTotal: 360,
      generalBedsAvailable: 70,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 46, isCriticallyLow: false },
      { group: 'A-', units: 9, isCriticallyLow: false },
      { group: 'B+', units: 58, isCriticallyLow: false },
      { group: 'B-', units: 8, isCriticallyLow: false },
      { group: 'AB+', units: 23, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 74, isCriticallyLow: false },
      { group: 'O-', units: 11, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY 100% Cashless / NABH Super Specialty',
      opdConsultFee: 700,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 85,
      approxTreatmentRange: 'PM-JAY 100% Cashless / NABH Super Specialty'
    }
  },
  {
    id: 'HOSP-UP-16',
    name: 'Regency Hospital (Tower 1 & 2), Sarvodaya Nagar',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 2.7,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'All Major TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 512 308 1111',
    mapsCoord: { lat: 26.4780, lng: 80.3080 },
    opdDepartments: [
      'Cardiology & Cardiac Surgery',
      'Renal Sciences & Dialysis',
      'Neurosciences',
      'Medical Oncology',
      'Joint Replacement & Ortho',
      'Emergency Trauma'
    ],
    bedTelemetry: {
      icuTotal: 58,
      icuAvailable: 14,
      ventilatorTotal: 28,
      ventilatorAvailable: 7,
      oxygenBedsTotal: 140,
      oxygenBedsAvailable: 38,
      generalBedsTotal: 360,
      generalBedsAvailable: 72,
      lastTelemetryPing: '1 min ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 42, isCriticallyLow: false },
      { group: 'A-', units: 8, isCriticallyLow: false },
      { group: 'B+', units: 54, isCriticallyLow: false },
      { group: 'B-', units: 7, isCriticallyLow: false },
      { group: 'AB+', units: 22, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 68, isCriticallyLow: false },
      { group: 'O-', units: 10, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Premier Kanpur Tertiary Hospital',
      opdConsultFee: 600,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 85,
      approxTreatmentRange: 'PM-JAY Cashless / Premier Kanpur Tertiary Hospital'
    }
  },
  {
    id: 'HOSP-UP-17',
    name: 'Apex Hospital & Purvanchal Cancer Institute',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 3.4,
    rating: 4.8,
    chikitsaCareScore: 95,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Tata Trusts Empanelled',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 542 231 6680',
    mapsCoord: { lat: 25.2890, lng: 82.9680 },
    opdDepartments: [
      'Comprehensive Oncology',
      'Cardiology & Cath Lab',
      'Neurosurgery',
      'Critical Care & Resuscitation',
      'Gastroenterology'
    ],
    bedTelemetry: {
      icuTotal: 48,
      icuAvailable: 12,
      ventilatorTotal: 24,
      ventilatorAvailable: 6,
      oxygenBedsTotal: 120,
      oxygenBedsAvailable: 34,
      generalBedsTotal: 260,
      generalBedsAvailable: 52,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 36, isCriticallyLow: false },
      { group: 'A-', units: 7, isCriticallyLow: false },
      { group: 'B+', units: 46, isCriticallyLow: false },
      { group: 'B-', units: 6, isCriticallyLow: false },
      { group: 'AB+', units: 19, isCriticallyLow: false },
      { group: 'AB-', units: 4, isCriticallyLow: true },
      { group: 'O+', units: 60, isCriticallyLow: false },
      { group: 'O-', units: 9, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Specialized Cancer & Trauma',
      opdConsultFee: 500,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 86,
      approxTreatmentRange: 'PM-JAY Cashless / Specialized Cancer & Trauma'
    }
  },
  {
    id: 'HOSP-UP-18',
    name: 'Heritage Hospitals, Lanka',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 2.6,
    rating: 4.7,
    chikitsaCareScore: 94,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 542 236 8888',
    mapsCoord: { lat: 25.2820, lng: 82.9980 },
    opdDepartments: [
      'Emergency & Trauma',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Nephrology'
    ],
    bedTelemetry: {
      icuTotal: 42,
      icuAvailable: 10,
      ventilatorTotal: 21,
      ventilatorAvailable: 5,
      oxygenBedsTotal: 105,
      oxygenBedsAvailable: 31,
      generalBedsTotal: 230,
      generalBedsAvailable: 46,
      lastTelemetryPing: '2 mins ago'
    },
    bloodBankStock: [
      { group: 'A+', units: 32, isCriticallyLow: false },
      { group: 'A-', units: 6, isCriticallyLow: false },
      { group: 'B+', units: 42, isCriticallyLow: false },
      { group: 'B-', units: 5, isCriticallyLow: true },
      { group: 'AB+', units: 17, isCriticallyLow: false },
      { group: 'AB-', units: 4, isCriticallyLow: true },
      { group: 'O+', units: 54, isCriticallyLow: false },
      { group: 'O-', units: 8, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Trusted Varanasi Private Care',
      opdConsultFee: 500,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 86,
      approxTreatmentRange: 'PM-JAY Cashless / Trusted Varanasi Care'
    }
  },
  {
    id: 'HOSP-UP-19',
    name: 'Pushpanjali Hospital & Research Centre, Delhi Gate',
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 3.1,
    rating: 4.7,
    chikitsaCareScore: 94,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'TPA Cashless'
    ],
    emergency24x7: true,
    contactNumber: '+91 562 285 0000',
    mapsCoord: { lat: 27.2020, lng: 77.9940 },
    opdDepartments: [
      'Cardiology & CTVS',
      'Neurosciences',
      'Nephrology & Renal Dialysis',
      'Orthopedics',
      'Trauma Resuscitation'
    ],
    bedTelemetry: {
      icuTotal: 46,
      icuAvailable: 11,
      ventilatorTotal: 23,
      ventilatorAvailable: 5,
      oxygenBedsTotal: 120,
      oxygenBedsAvailable: 35,
      generalBedsTotal: 270,
      generalBedsAvailable: 52,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 34, isCriticallyLow: false },
      { group: 'A-', units: 7, isCriticallyLow: false },
      { group: 'B+', units: 44, isCriticallyLow: false },
      { group: 'B-', units: 6, isCriticallyLow: false },
      { group: 'AB+', units: 18, isCriticallyLow: false },
      { group: 'AB-', units: 4, isCriticallyLow: true },
      { group: 'O+', units: 58, isCriticallyLow: false },
      { group: 'O-', units: 9, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Premier Agra Private Hospital',
      opdConsultFee: 550,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 85,
      approxTreatmentRange: 'PM-JAY Cashless / Premier Agra Private Hospital'
    }
  },
  {
    id: 'HOSP-UP-20',
    name: 'Nazareth Hospital (Charitable Trust)',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'CHARITABLE_TRUST',
    distanceKm: 2.2,
    rating: 4.8,
    chikitsaCareScore: 95,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'Subsidized Trust Grants'
    ],
    emergency24x7: true,
    contactNumber: '+91 532 240 7334',
    mapsCoord: { lat: 25.4590, lng: 81.8480 },
    opdDepartments: [
      'Emergency & General Medicine',
      'General Surgery',
      'Obstetrics & Gynecology',
      'Orthopedics',
      'Pediatrics'
    ],
    bedTelemetry: {
      icuTotal: 38,
      icuAvailable: 10,
      ventilatorTotal: 19,
      ventilatorAvailable: 5,
      oxygenBedsTotal: 95,
      oxygenBedsAvailable: 30,
      generalBedsTotal: 330,
      generalBedsAvailable: 68,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 28, isCriticallyLow: false },
      { group: 'A-', units: 6, isCriticallyLow: false },
      { group: 'B+', units: 36, isCriticallyLow: false },
      { group: 'B-', units: 5, isCriticallyLow: true },
      { group: 'AB+', units: 15, isCriticallyLow: false },
      { group: 'AB-', units: 3, isCriticallyLow: true },
      { group: 'O+', units: 48, isCriticallyLow: false },
      { group: 'O-', units: 7, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'SUBSIDIZED_CHARITABLE',
      tierLabel: 'Subsidized Trust Grants & Concessions',
      opdConsultFee: 150,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 5,
      costScore: 94,
      approxTreatmentRange: 'Subsidized Trust Grants / ₹150 Consultation'
    }
  },
  {
    id: 'HOSP-UP-21',
    name: 'Shri Ram Murti Smarak (SRMS) Institute of Medical Sciences & Hospital',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 4.6,
    rating: 4.8,
    chikitsaCareScore: 96,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'Tata Trusts Empanelled'
    ],
    emergency24x7: true,
    contactNumber: '+91 581 258 2031',
    mapsCoord: { lat: 28.4550, lng: 79.4420 },
    opdDepartments: [
      'Trauma & Emergency Resuscitation',
      'Advanced Cardiology & Cath Lab',
      'Radiation Oncology',
      'Neurosurgery',
      'Organ Transplant'
    ],
    bedTelemetry: {
      icuTotal: 68,
      icuAvailable: 17,
      ventilatorTotal: 34,
      ventilatorAvailable: 9,
      oxygenBedsTotal: 190,
      oxygenBedsAvailable: 54,
      generalBedsTotal: 950,
      generalBedsAvailable: 180,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 45, isCriticallyLow: false },
      { group: 'A-', units: 9, isCriticallyLow: false },
      { group: 'B+', units: 58, isCriticallyLow: false },
      { group: 'B-', units: 8, isCriticallyLow: false },
      { group: 'AB+', units: 24, isCriticallyLow: false },
      { group: 'AB-', units: 5, isCriticallyLow: true },
      { group: 'O+', units: 76, isCriticallyLow: false },
      { group: 'O-', units: 11, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / 950-Bed Bareilly Medical Hub',
      opdConsultFee: 400,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 10,
      costScore: 88,
      approxTreatmentRange: 'PM-JAY Cashless / 950-Bed Bareilly Medical Hub'
    }
  },
  {
    id: 'HOSP-UP-22',
    name: 'Anand Hospital & Research Center, Garh Road',
    city: 'Meerut',
    state: 'Uttar Pradesh',
    type: 'PRIVATE_EMPANELLED',
    distanceKm: 3.6,
    rating: 4.7,
    chikitsaCareScore: 94,
    acceptedGovSchemes: [
      'Ayushman Bharat PM-JAY',
      'Mukhyamantri Jan Arogya Yojana UP',
      'CGHS',
      'ECHS'
    ],
    emergency24x7: true,
    contactNumber: '+91 121 260 2200',
    mapsCoord: { lat: 28.9840, lng: 77.7060 },
    opdDepartments: [
      'Emergency & Trauma Care',
      'Cardiology',
      'Joint Replacement & Ortho',
      'Nephrology & Dialysis',
      'Critical Care Medicine'
    ],
    bedTelemetry: {
      icuTotal: 44,
      icuAvailable: 11,
      ventilatorTotal: 22,
      ventilatorAvailable: 5,
      oxygenBedsTotal: 115,
      oxygenBedsAvailable: 34,
      generalBedsTotal: 290,
      generalBedsAvailable: 56,
      lastTelemetryPing: 'Just now'
    },
    bloodBankStock: [
      { group: 'A+', units: 32, isCriticallyLow: false },
      { group: 'A-', units: 7, isCriticallyLow: false },
      { group: 'B+', units: 42, isCriticallyLow: false },
      { group: 'B-', units: 6, isCriticallyLow: false },
      { group: 'AB+', units: 18, isCriticallyLow: false },
      { group: 'AB-', units: 4, isCriticallyLow: true },
      { group: 'O+', units: 56, isCriticallyLow: false },
      { group: 'O-', units: 9, isCriticallyLow: false }
    ],
    costProfile: {
      tier: 'PMJAY_CASHLESS_MODERATE',
      tierLabel: 'PM-JAY Cashless / Premier Meerut Super Specialty',
      opdConsultFee: 500,
      pmjayCashlessCoverage: true,
      estOutOfPocketPercent: 12,
      costScore: 85,
      approxTreatmentRange: 'PM-JAY Cashless / Premier Meerut Super Specialty'
    }
  }
];
