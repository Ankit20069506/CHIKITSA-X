export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN';
export type AppLanguage = 'EN' | 'HI';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  hospitalId?: string;
  abhaAddress?: string;
}

export interface ABHAProfile {
  abhaNumber: string; // 14-digit format "14-2026-9812-4401"
  abhaAddress: string; // e.g. "ankit.patel@abdm"
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  mobile: string;
  address: string;
  kycVerified: boolean;
  linkedFacilitiesCount: number;
  qrPayload: string;
}

export interface FHIRRecord {
  id: string;
  resourceType: 'DiagnosticReport' | 'MedicationRequest' | 'Condition' | 'DischargeSummary';
  date: string;
  facility: string;
  doctor: string;
  title: string;
  summary: string;
  rawJsonUrl?: string;
}

export interface BodySymptom {
  partId: 'head' | 'neck' | 'chest' | 'abdomen' | 'spine' | 'arms' | 'legs' | 'general';
  partName: string;
  hindiName: string;
  symptoms: string[];
  severity: number; // 1 - 10
  duration: string;
  notes?: string;
}

export interface TriageDifferential {
  conditionName: string;
  hindiName: string;
  icd10: string;
  probability: 'HIGH' | 'MODERATE' | 'LOW';
  urgency: 'EMERGENCY' | 'URGENT_OPD' | 'ROUTINE_CONSULT';
  reasoning: string;
  recommendedSpecialty: string;
  redFlags: string[];
}

export interface DrugInteractionWarning {
  drugA: string;
  drugB: string;
  severity: 'HIGH' | 'MODERATE' | 'MILD';
  description: string;
  actionRequired: string;
}

export interface LabBiomarker {
  name: string;
  hindiName: string;
  value: number;
  unit: string;
  normalRange: [number, number];
  status: 'LOW' | 'NORMAL' | 'ELEVATED' | 'CRITICAL_HIGH';
  interpretation: string;
  hindiInterpretation: string;
}

export interface GenericDrugMapping {
  id: string;
  brandedName: string;
  genericMolecule: string;
  dosage: string;
  brandedPrice: number;
  janAushadhiPrice: number;
  savingsPercentage: number;
  category: string;
}

export interface HospitalBedTelemetry {
  icuTotal: number;
  icuAvailable: number;
  ventilatorTotal: number;
  ventilatorAvailable: number;
  oxygenBedsTotal: number;
  oxygenBedsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
  lastTelemetryPing: string;
}

export interface BloodGroupStock {
  group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  isCriticallyLow: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'GOVERNMENT' | 'PRIVATE_EMPANELLED' | 'CHARITABLE_TRUST';
  distanceKm: number;
  rating: number;
  chikitsaCareScore: number;
  acceptedGovSchemes: string[];
  bedTelemetry: HospitalBedTelemetry;
  bloodBankStock: BloodGroupStock[];
  opdDepartments: string[];
  emergency24x7: boolean;
  contactNumber: string;
  mapsCoord: { lat: number; lng: number };
}

export interface LiveOPDToken {
  id: string;
  referenceId: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorName: string;
  appointmentDate: string;
  appointmentSlot: string;
  tokenNumber: number;
  currentServingToken: number;
  estimatedWaitMinutes: number;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
  qrVerifiedAt?: string;
  doctorDelayNotes?: string;
}

export interface CareCostAssessment {
  procedureName: string;
  indicativeGrossCost: number;
  pmjaySubsidy: number;
  stateSchemeSubsidy: number;
  privateInsuranceClaim: number;
  ngoCharitableGrant: number;
  patientSelfPay: number;
  netFinancialGap: number;
  isCompletelyCashless: boolean;
}

export interface MedicalEMIOption {
  months: number;
  monthlyAmount: number;
  interestRate: number; // 0%
  processingFee: number;
  totalRepayment: number;
  isZeroInterest: boolean;
}

export interface CrowdfundingCampaign {
  id: string;
  patientName: string;
  diagnosis: string;
  hospitalName: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  story: string;
  verifiedDoctorLetterUrl: string;
  qrDonationLink: string;
  daysRemaining: number;
}

export interface SOAPClinicalNote {
  id: string;
  patientId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    genericAlternative?: string;
  }>;
  digitalSignature: string;
  verifiedByQR: string;
}
