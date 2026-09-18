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

export interface HospitalCostProfile {
  tier: 'FREE_PUBLIC' | 'SUBSIDIZED_CHARITABLE' | 'PMJAY_CASHLESS_MODERATE';
  tierLabel: string;
  opdConsultFee: number;
  pmjayCashlessCoverage: boolean;
  estOutOfPocketPercent: number; // 0% = completely free
  costScore: number; // 0 to 100 (100 = most affordable / ₹0 out-of-pocket)
  approxTreatmentRange: string;
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
  costProfile?: HospitalCostProfile;
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

export interface VoiceIntakeRecord {
  id: string;
  timestamp: string;
  language: 'hi-IN' | 'en-IN' | 'hinglish' | 'bn-IN' | 'ta-IN';
  spokenTranscript: string;
  englishTranslation?: string;
  chiefComplaint: string;
  extractedSymptoms: string[];
  duration: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  painScaleVAS: number; // 1 - 10
  bodyRegion: string;
  isEmergencyRedFlag: boolean;
  redFlagReason?: string;
  recommendedSpecialty: string;
  clinicalImpression: string;
  confidenceScore: number; // e.g. 94%
}

export interface GovSchemeInfo {
  id: string;
  name: string;
  hindiName: string;
  level: 'CENTRAL' | 'STATE';
  state?: string;
  maxCoverAmount: number;
  eligibleCategory: string;
  keyBenefits: string[];
  requiredDocs: string[];
  applicationPortalUrl: string;
  tollFreeHelpline: string;
  isEligibleDemo: boolean;
}

export interface InsurancePolicyClaim {
  id: string;
  insurerName: string;
  policyNumber: string;
  sumInsured: number;
  remainingSum: number;
  coPayPercent: number;
  tpaName: string;
  preAuthStatus: 'APPROVED' | 'IN_REVIEW' | 'DOCUMENT_REQUIRED' | 'SETTLED';
  sanctionedAmount: number;
  claimReferenceNo: string;
  lastUpdated: string;
}

export interface NGOGrantProgram {
  id: string;
  orgName: string;
  programTitle: string;
  hindiTitle: string;
  focusArea: 'CANCER' | 'CARDIAC_PEDIATRIC' | 'KIDNEY_DIALYSIS' | 'GENERAL_BPL';
  maxGrantAmount: number;
  criteria: string;
  trustContact: string;
  verificationOfficer: string;
  turnaroundTime: string;
}

export interface HospitalRegistrationForm {
  name: string;
  rohiniId: string; // Registry of Hospitals in Network of Insurance (e.g. "ROHINI-411045-88")
  nabhLevel: 'FULL_NABH' | 'ENTRY_LEVEL' | 'NABL_ACCREDITED' | 'STATE_CERTIFIED';
  licenseNumber: string;
  type: 'GOVERNMENT' | 'PRIVATE_EMPANELLED' | 'CHARITABLE_TRUST';
  city: string;
  state: string;
  contactNumber: string;
  emergency24x7: boolean;
  icuTotal: number;
  ventilatorTotal: number;
  oxygenBedsTotal: number;
  generalBedsTotal: number;
  bloodBankInHouse: boolean;
  bloodUnitsInitial: number;
  acceptedGovSchemes: string[];
  opdDepartments: string[];
  nodalOfficerName: string;
  nodalOfficerPhone: string;
}

export interface AutonomousAgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'IDLE' | 'PROCESSING' | 'ALERT';
  intervalSeconds: number;
  lastExecutionTime: string;
  metricsProcessedCount: number;
  lastLogMessage: string;
  recentLogs: Array<{
    timestamp: string;
    level: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    message: string;
  }>;
}

export interface MasterAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | 'AGENT_SWARM' | 'SYSTEM_CORE';
  action: string;
  resourceTarget: string;
  details: string;
  abdmComplianceTag: string;
}

export interface JourneyPersonaStep {
  id: string;
  order: number;
  persona: UserRole;
  title: string;
  hindiTitle: string;
  subtitle: string;
  targetTab: string;
  targetSubTab?: string;
  icon: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'READY';
  deliverables: string[];
  agentCollaboration: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nmcRegistrationId: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  hospitalAffiliation: string;
  department: string;
  isNmcVerified: boolean;
  avatarUrl?: string;
  digitalSignatureId: string;
}

export interface PatientRegistrationForm {
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  city: string;
  state: string;
  autoCreateABHA: boolean;
  abhaAddress?: string;
}

export interface DoctorRegistrationForm {
  fullName: string;
  email: string;
  mobile: string;
  nmcRegistrationId: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  hospitalAffiliation: string;
  verificationMethod: 'EMAIL_OTP' | 'NMC_REGISTRY_OTP';
}

export interface OTPVerificationState {
  destination: string;
  otpCode: string;
  expiresAt: number;
  isVerified: boolean;
  attempts: number;
}

export interface CSRCareProgram {
  id: string;
  corporateName: string;
  corporateLogoText: string;
  programTitle: string;
  hindiTitle: string;
  corporateTier: 'FORTUNE_INDIA_500' | 'CENTRAL_PSU' | 'GLOBAL_CORP';
  annualCSRBudgetCrores: number;
  maxGrantPerPatient: number;
  focusAreas: Array<'ONCOLOGY_CANCER' | 'PEDIATRIC_CARDIAC' | 'ORGAN_TRANSPLANT' | 'KIDNEY_DIALYSIS' | 'RARE_DISEASE' | 'RURAL_TRAUMA'>;
  coPayEligibleWithPMJAY: boolean;
  criteria: string;
  empanelledHospitals: string[];
  nodalContact: string;
  avgApprovalHours: number;
}

export interface CSRApplication {
  id: string;
  referenceNo: string;
  patientName: string;
  patientAbha: string;
  corporateId: string;
  corporateName: string;
  treatmentName: string;
  hospitalName: string;
  totalHospitalBill: number;
  pmjayOrInsuranceCover: number;
  requestedCSRAmount: number;
  sanctionedAmount: number;
  status: 'SUBMITTED' | 'DOC_VERIFIED' | 'CSR_APPROVED' | 'DISBURSED_TO_HOSPITAL';
  submissionDate: string;
  sanctionDate?: string;
  utrNumber?: string;
  corporateReviewNotes?: string;
}

