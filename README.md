<<<<<<< HEAD
# CHIKITSAX — AI-Powered Patient Intelligence, Care Navigation & Financial Assistance Platform

> **Tagline:** *"From Symptoms to Care, From Care to Financial Support."*  
> **Target:** Smart India Hackathon (SIH) Full-Stack Working Prototype

---

## 📌 Executive Summary & Core Idea

CHIKITSAX is not merely a hospital search directory. It is a **Care-to-Cost Decision & Navigation Platform** designed to solve two massive healthcare challenges in India:

1. **Clinical Fragmentation:** Patients struggle to understand symptoms, organize physical medical records, and find the right hospital specialty.
2. **Financial Catastrophe:** Out-of-pocket medical expenses push millions of Indian families into poverty due to a lack of awareness regarding health insurance, **Ayushman Bharat PM-JAY**, state health schemes, and NGO funds.

CHIKITSAX unifies the entire patient journey:
```
Patient Login → AI Voice Intake → Medical Record Upload (OCR) → Unified Health Profile → 
AI Clinical Triage → CHIKITSAX Care Score Hospital Recommendation → OPD Registration → 
Reference ID Generation → Secure QR Pass → Hospital Check-in Verification → Patient Consent → 
Doctor Consultation → Treatment Cost Estimate → Insurance + Gov Scheme + NGO Matching → 
Care-to-Cost Financial Gap Calculation → AI Finance Scenario Planner
```

---

## 🚀 Key Differentiators & Features

### 1. 🎙️ AI Voice Symptom Intake
- Integrated Web Speech API for natural voice input in English & regional Indian languages.
- Fallback sample transcripts for instant hackathon demonstrations.
- Automatically extracts structured metrics: Symptoms, Duration, Severity, and Affected Body Part with explicit AI safety disclaimers.

### 2. 📄 Medical Record Upload & OCR Engine
- Multi-format document uploader (PDF, JPG, PNG) supporting Prescriptions, Lab Reports, Discharge Summaries, and Radiology Reports.
- Simulated multi-step OCR extraction pipeline.
- **100% Editable extracted values** (Medicines, Diagnoses, Lab Metrics) before saving to the patient's unified record.

### 3. 🏥 CHIKITSAX Care Score Hospital Recommendation Engine
Ranks tertiary hospitals using a 5-vector transparent scoring algorithm:
$$\text{Care Score} = (\text{Clinical Fit} \times 35\%) + (\text{Affordability} \times 25\%) + (\text{Distance} \times 15\%) + (\text{Availability} \times 15\%) + (\text{Support Services} \times 10\%)$$
- Includes **"Why Recommended?"** transparent breakdown modals explaining exact weightings.
- Side-by-side hospital comparison matrix.

### 4. 🎟️ Digital OPD Pass & Secure Token QR Protocol
- Multi-step appointment booking producing a unique Reference ID (e.g. `CHX-2026-8A92F`).
- HTML5 Canvas QR Pass generator encoding **only encrypted reference tokens** — keeping sensitive raw medical data out of QR payloads for privacy.

### 5. 🔑 Hospital Staff Check-in & Patient Consent Protocol
- Hospital Admin / Reception Desk scanner to verify Reference IDs and check-in patients.
- Patient consent workflow: Hospital staff request record access $\rightarrow$ Patient receives an instant alert $\rightarrow$ Once approved, doctor unlocks full clinical history.

### 6. 🩺 Doctor Consultation Workspace & Cost Estimate Generator
- Doctor workspace displaying authorized patient symptoms, OCR records, and AI Triage.
- Itemized **Treatment Cost Estimate Generator** (Procedure, Room, Labs, Medications) yielding indicative cost ranges (e.g. ₹85,000 – ₹1,15,000).

### 7. 💳 Care-to-Cost Live Financial Gap Engine
Dynamic live formula calculating out-of-pocket exposure:
$$\text{Financial Gap} = \text{Treatment Cost} - \text{Insurance} - \text{PM-JAY Gov Scheme} - \text{NGO Aid} - \text{Patient Self Pay}$$
- Instant eligibility matching for **Ayushman Bharat PM-JAY**, **MJPJAY**, and NGO funds (Tata Trusts, Being Human Foundation, Smile Foundation).

### 8. 📊 AI Finance Scenario Planner
Side-by-side comparison engine evaluating multiple hospital cost pathways:
- **Scenario A:** Selected Tertiary Hospital (Net Gap: ₹15,000)
- **Scenario B:** AIIMS Public Referral (Net Gap: ₹0 — 100% Gov Subsidy)
- **Scenario C:** Empaneled Community Center (Net Gap: ₹0 — Zero Gap)

### 9. 🚨 Urgent Care Emergency Pathway
- Always-visible red **"EMERGENCY HELP"** button.
- Urgent Care Pathway modal providing emergency guidance, nearest 24/7 Trauma ICUs, distance, bed availability, direct phone dialer, and Google Maps directions.

---

## 👥 Demo Credentials & One-Click Role Switcher

For Smart India Hackathon evaluation, a **SIH Demo Role Switcher Bar** is pinned to the top of the app:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@chikitsax.demo` | *(One-click)* | Voice Intake, Record Upload, Hospital Finder, OPD Pass, Financial Gap, Finance Planner |
| **Doctor** | `doctor@chikitsax.demo` | *(One-click)* | View Patient History, Add Clinical Notes, Prescriptions, Generate Cost Estimates |
| **Hospital Admin** | `hospital@chikitsax.demo` | *(One-click)* | QR Code Check-in, Verify Reference ID, Request Patient Medical Consent |

---

## 🛠️ Technology Stack & System Architecture

```
React 19 + TypeScript + Vite (Frontend)
        ↓
API Client (src/services/apiClient.ts)
        ↓
FastAPI REST API (backend/app/main.py)
        ↓
SQLAlchemy 2.0 ORM Engine
        ↓
SQLite (backend/chikitsax.db) / PostgreSQL Ready
        ↓
CHIKITSAX Modular Services (Voice Intake / OCR / Triage / Care Score / Financial Assistance)
```

- **Frontend Framework:** React 19 + TypeScript + Vite
- **Backend API:** FastAPI (Python 3.10+) with Uvicorn ASGI Server
- **ORM & Database:** SQLAlchemy 2.0 with SQLite (`backend/chikitsax.db` auto-created & seeded on startup)
- **API Client:** Configurable REST API client (`src/services/apiClient.ts`) with fallback to LocalDB
- **Design System:** Custom Vanilla CSS Design System with HSL tokens, Glassmorphism, Micro-animations, Google Fonts (Inter & Outfit), and High-Contrast Accessibility.
- **State Management & Persistence:** Modular `LocalDB` layer with `localStorage` fallback sync and real-time audit logging across role switches.
- **QR Code Engine:** HTML5 Canvas QR Rendering (`qrcode` library) + Camera QR Scanner (`jsQR`).
- **Voice Engine:** Web Speech API (`webkitSpeechRecognition`) with pre-loaded fallback audio transcripts.
- **Icons & Visuals:** `lucide-react`.

---

## 💾 Database Schema (24 Relational Entities)

1. `users` (id, email, name, role, phone, hospitalId)
2. `patient_profiles` (id, userId, fullName, age, gender, bloodGroup, phone, address, symptoms, medicalHistory, medications, allergies, careStage, rationCardType)
3. `symptom_intakes` (id, patientId, timestamp, rawTranscript, extractedSymptoms, duration, severity, isEmergencyAlert)
4. `medical_records` (id, patientId, fileName, fileType, category, uploadDate, ocrExtractedData, isVerifiedByPatient)
5. `triage_results` (id, patientId, timestamp, riskLevel, urgency, symptomsConsidered, clinicalReasoning, recommendedSpecialty)
6. `hospitals` (id, name, code, distanceKm, emergencyAvailable, emergencyBedsFree, clinicalFitScore, affordabilityScore, chikitsaxCareScore, estimatedCostRange, acceptedGovSchemes)
7. `doctors` (id, hospitalId, name, specialty, qualification, experienceYears, consultationFee, availableSlots, avatar)
8. `opd_registrations` (id, referenceId, patientId, hospitalId, department, doctorId, appointmentDate, appointmentTime, status, qrToken)
9. `qr_tokens` (id, referenceId, token, patientId, hospitalId, isVerified)
10. `consents` (id, patientId, hospitalId, doctorId, requestedAt, status, accessibleSections)
11. `consultations` (id, appointmentId, referenceId, patientId, doctorId, clinicalNotes, diagnosis, treatmentPlan, status)
12. `treatment_cost_estimates` (id, patientId, hospitalId, procedureName, estimatedCostRange, breakdown, confidenceLevel)
13. `insurance_policies` (id, patientId, providerName, policyNumber, sumInsured, availableBalance)
14. `insurance_claims` (id, patientId, policyId, claimedAmount, status, claimReferenceNumber)
15. `government_schemes` (id, schemeCode, schemeName, maxBenefitAmount, eligibilityCriteria)
16. `scheme_eligibility` (schemeId, isEligible, matchingCriteria, potentialSupportAmount)
17. `ngo_support` (id, organizationName, supportType, maxAssistanceAmount, applicationStatus)
18. `financial_assessments` (id, patientId, estimatedTreatmentCost, insuranceCoverage, governmentSupport, ngoAssistance, patientSelfContribution, financialGap)
19. `finance_plans` (id, scenarioTitle, hospitalName, estimatedCost, remainingGap)
20. `audit_logs` (id, timestamp, actorRole, actorId, action, details)

---

## 🏃 Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+ or v10+)

### Steps
1. Clone / Navigate to workspace directory:
   ```bash
   cd "d:/antigravity 2.0/insta reels/value reels/with 3 skills create new reels"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

### Production Build Verification
To compile TypeScript and build production assets:
```bash
npm run build
```

---

## 🔌 How to Replace Mock Services with Production APIs

| Service Module | Current Prototype Abstraction | Production Replacement Strategy |
| :--- | :--- | :--- |
| **Voice Intake** | `mockVoiceService` & Web Speech API | Connect Google Cloud Speech-to-Text API or Bhashini API for regional languages. |
| **OCR Extraction** | `mockOCRService` | Replace with Google Cloud Vision OCR API or AWS Textract medical parser. |
| **Clinical Triage** | `mockTriageService` | Connect OpenAI GPT-4o / Med-PaLM 2 fine-tuned clinical triage model. |
| **ABDM / FHIR** | `db.getPatientProfile()` | Connect Ayushman Bharat Digital Mission (ABDM) Health Repository API. |
| **Insurance Claims** | `mockFinanceService` | Connect National Health Authority (NHA) & Insurer Cashless APIs. |

---

## 🎬 Complete SIH Live Demonstration Guide

Follow this sequence to present the complete connected prototype to SIH judges:

1. **Landing Page:** Show headline *"Intelligent Healthcare. Affordable Care."* Click **"Start Your Care Journey"**.
2. **AI Voice Intake:** Click the microphone button or pick a sample transcript ("Chest discomfort and shortness of breath"). Review extracted symptoms and click **"Save & Update Health Profile"**.
3. **Medical Record OCR:** Upload a demo prescription. Review extracted medicines with inline editing, and save to profile.
4. **AI Clinical Triage:** Click **"Synthesize Triage Report"**. Review Moderate/High Risk rating and reasoning.
5. **Hospital Recommendation:** View hospitals ranked by Care Score. Click **"Why Recommended?"** on CarePlus Hospital to show algorithm transparency.
6. **OPD Registration:** Click **"Select Hospital"**. Pick doctor (Dr. Rajesh Kulkarni), date, and slot. Click **"Confirm OPD"**.
7. **Digital QR Pass:** View generated Reference ID (`CHX-2026-8A92F`) and canvas QR Pass.
8. **Hospital Admin Verification:** Click **"Hospital Admin"** in top bar. Click **"Verify Appointment"**. View check-in verification and click **"Request Patient Medical Access Consent"**.
9. **Patient Consent Approval:** Switch to Patient role. Click **"Approve & Grant Medical Access"** on the alert banner.
10. **Doctor Consultation & Cost Estimate:** Switch to Doctor role. View unlocked patient records, enter clinical diagnosis, and click **"Generate Treatment Cost Estimate"** (e.g. ₹95,000).
11. **Care-to-Cost Financial Gap:** Switch back to Patient role. View stacked Insurance + PM-JAY + NGO grants reducing net Financial Gap to ₹0!
12. **AI Finance Planner:** Click **"Launch AI Finance Scenario Planner"** to compare alternate hospital cost scenarios.
13. **Emergency Pathway:** Click the red **"EMERGENCY HELP"** button anywhere to demonstrate instant emergency facility routing.

---
=======
# CHIKITSA-X
>>>>>>> 7fcc04c8e170939b963a45f1ef2db6b21bfcec3c
