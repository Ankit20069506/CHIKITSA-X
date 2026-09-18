-- ====================================================================
-- CHIKITSA-X Enterprise Healthcare Platform - PostgreSQL Schema
-- Ayushman Bharat Digital Mission (ABDM) & HIPAA Compliant DDL
-- ====================================================================

-- 1. USERS & PATIENT ACCOUNTS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(64),
  role VARCHAR(32) NOT NULL DEFAULT 'PATIENT',
  dob DATE,
  gender VARCHAR(32),
  blood_group VARCHAR(16),
  city VARCHAR(128),
  state VARCHAR(128),
  abha_number VARCHAR(64),
  abha_address VARCHAR(128),
  kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_abha_number ON users(abha_number);

-- 2. EMPANELED HOSPITALS & HEALTH FACILITIES
CREATE TABLE IF NOT EXISTS hospitals (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  type VARCHAR(64) NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  chikitsa_care_score INTEGER DEFAULT 90,
  emergency_24x7 BOOLEAN DEFAULT TRUE,
  contact_number VARCHAR(64),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accepted_schemes TEXT[],
  opd_departments TEXT[],
  bed_telemetry JSONB,
  blood_stock JSONB,
  cost_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);

-- 3. MEDICAL PRACTITIONERS & NMC REGISTRY DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(64),
  nmc_registration_id VARCHAR(64) UNIQUE NOT NULL,
  specialty VARCHAR(128) NOT NULL,
  qualifications VARCHAR(255),
  experience_years INTEGER DEFAULT 5,
  hospital_affiliation VARCHAR(255),
  department VARCHAR(128),
  is_nmc_verified BOOLEAN DEFAULT TRUE,
  digital_signature_id VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);

-- 4. LIVE OPD QUEUE TOKENS & APPOINTMENTS
CREATE TABLE IF NOT EXISTS opd_appointments (
  id VARCHAR(64) PRIMARY KEY,
  reference_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  hospital_id VARCHAR(64) NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  appointment_date VARCHAR(64) NOT NULL,
  appointment_slot VARCHAR(64) NOT NULL,
  token_number INTEGER NOT NULL,
  current_serving_token INTEGER NOT NULL,
  estimated_wait_minutes INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'WAITING',
  doctor_delay_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opd_patient_id ON opd_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_opd_hospital_id ON opd_appointments(hospital_id);

-- 5. 1-TAP EMERGENCY DISPATCHES & GREEN CORRIDOR
CREATE TABLE IF NOT EXISTS emergency_dispatches (
  id VARCHAR(64) PRIMARY KEY,
  unit_id VARCHAR(64) NOT NULL,
  caller_phone VARCHAR(64),
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  hospital_id VARCHAR(64),
  hospital_name VARCHAR(255),
  status VARCHAR(64) NOT NULL,
  eta_minutes INTEGER NOT NULL,
  speed_kmh INTEGER NOT NULL,
  reserved_icu_bed VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CSR & NGO MEDICAL RELIEF APPLICATIONS
CREATE TABLE IF NOT EXISTS csr_applications (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  annual_income NUMERIC(12, 2) NOT NULL,
  requested_amount NUMERIC(12, 2) NOT NULL,
  diagnosis TEXT NOT NULL,
  program_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CRYPTOGRAPHIC TAMPER-EVIDENT AUDIT LEDGER (HMAC-SHA256)
CREATE TABLE IF NOT EXISTS audit_ledger (
  block_index INTEGER PRIMARY KEY,
  timestamp VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  resource_id VARCHAR(64) NOT NULL,
  details JSONB NOT NULL,
  previous_hash VARCHAR(128) NOT NULL,
  hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_resource_id ON audit_ledger(resource_id);
