import { Pool, type PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: Pool | null = null;
let isConnected = false;

export function getPostgresPool(): Pool | null {
  return pool;
}

export function isPostgresConnected(): boolean {
  return isConnected;
}

/**
 * Initializes connection pool and auto-runs schema DDL migrations if DATABASE_URL is configured
 */
export async function initPostgres(): Promise<{ connected: boolean; message: string }> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('ℹ️ [PostgreSQL] No DATABASE_URL provided in environment. Operating in Zero-Crash in-memory fallback mode.');
    isConnected = false;
    return {
      connected: false,
      message: 'DATABASE_URL not configured. Operating in resilient in-memory mode.'
    };
  }

  try {
    const isCloudDb =
      databaseUrl.includes('neon.tech') ||
      databaseUrl.includes('supabase.co') ||
      databaseUrl.includes('pooler.supabase.com') ||
      databaseUrl.includes('amazonaws.com') ||
      databaseUrl.includes('sslmode=require');

    const config: PoolConfig = {
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: isCloudDb ? { rejectUnauthorized: false } : undefined
    };

    pool = new Pool(config);

    // Test connectivity
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time, current_database() AS db_name');
    client.release();

    console.log(`🐘 [PostgreSQL] Connected to "${result.rows[0].db_name}" successfully at ${result.rows[0].current_time}`);

    // Run schema migrations
    let ddl = '';
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      ddl = fs.readFileSync(schemaPath, 'utf8');
    } else {
      ddl = FALLBACK_SCHEMA_SQL;
    }

    if (ddl) {
      await pool.query(ddl);
      console.log('📋 [PostgreSQL] Schema DDL migrated successfully (tables verified).');
    }

    isConnected = true;
    return {
      connected: true,
      message: `Connected to PostgreSQL database: ${result.rows[0].db_name}`
    };
  } catch (error: any) {
    console.warn(`⚠️ [PostgreSQL] Connection attempt failed: ${error?.message || error}. Falling back gracefully to in-memory store.`);
    isConnected = false;
    return {
      connected: false,
      message: `Failed to connect: ${error?.message || 'Unknown error'}`
    };
  }
}

// ====================================================================
// TYPED REPOSITORY HELPERS (POSTGRESQL WITH IN-MEMORY RESILIENCE)
// ====================================================================

export const pgUsers = {
  async insert(user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    city?: string;
    state?: string;
    abhaNumber?: string;
    abhaAddress?: string;
    kycVerified?: boolean;
  }) {
    if (!pool || !isConnected) return null;
    try {
      const q = `
        INSERT INTO users (id, name, email, phone, role, dob, gender, blood_group, city, state, abha_number, abha_address, kyc_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          abha_number = EXCLUDED.abha_number,
          abha_address = EXCLUDED.abha_address,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const res = await pool.query(q, [
        user.id,
        user.name,
        user.email || null,
        user.phone || null,
        user.role || 'PATIENT',
        user.dob || null,
        user.gender || null,
        user.bloodGroup || null,
        user.city || null,
        user.state || null,
        user.abhaNumber || null,
        user.abhaAddress || null,
        user.kycVerified ?? true
      ]);
      return res.rows[0];
    } catch (err) {
      console.error('pgUsers.insert error:', err);
      return null;
    }
  },

  async findByPhone(phone: string) {
    if (!pool || !isConnected) return null;
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const res = await pool.query('SELECT * FROM users WHERE phone LIKE $1 LIMIT 1;', [`%${cleanPhone}%`]);
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async findByEmail(email: string) {
    if (!pool || !isConnected) return null;
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;', [email]);
      return res.rows[0] || null;
    } catch (err) {
      return null;
    }
  },

  async count() {
    if (!pool || !isConnected) return 0;
    try {
      const res = await pool.query('SELECT COUNT(*) FROM users;');
      return parseInt(res.rows[0].count, 10);
    } catch (err) {
      return 0;
    }
  }
};

export const pgAppointments = {
  async insert(apt: {
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
    status?: string;
  }) {
    if (!pool || !isConnected) return null;
    try {
      const q = `
        INSERT INTO opd_appointments (
          id, reference_id, patient_id, patient_name, hospital_id, hospital_name,
          department, doctor_name, appointment_date, appointment_slot, token_number,
          current_serving_token, estimated_wait_minutes, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `;
      const res = await pool.query(q, [
        apt.id,
        apt.referenceId,
        apt.patientId,
        apt.patientName,
        apt.hospitalId,
        apt.hospitalName,
        apt.department,
        apt.doctorName,
        apt.appointmentDate,
        apt.appointmentSlot,
        apt.tokenNumber,
        apt.currentServingToken,
        apt.estimatedWaitMinutes,
        apt.status || 'WAITING'
      ]);
      return res.rows[0];
    } catch (err) {
      console.error('pgAppointments.insert error:', err);
      return null;
    }
  },

  async findByPatient(patientId: string) {
    if (!pool || !isConnected) return [];
    try {
      const res = await pool.query('SELECT * FROM opd_appointments WHERE patient_id = $1 ORDER BY created_at DESC;', [patientId]);
      return res.rows;
    } catch (err) {
      return [];
    }
  }
};

export const pgAudit = {
  async insertBlock(block: {
    index: number;
    timestamp: string;
    eventType: string;
    actorId: string;
    actorRole: string;
    resourceId: string;
    details: any;
    previousHash: string;
    hash: string;
  }) {
    if (!pool || !isConnected) return null;
    try {
      const q = `
        INSERT INTO audit_ledger (block_index, timestamp, event_type, actor_id, actor_role, resource_id, details, previous_hash, hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (block_index) DO NOTHING
        RETURNING *;
      `;
      const res = await pool.query(q, [
        block.index,
        block.timestamp,
        block.eventType,
        block.actorId,
        block.actorRole,
        block.resourceId,
        JSON.stringify(block.details),
        block.previousHash,
        block.hash
      ]);
      return res.rows[0];
    } catch (err) {
      console.error('pgAudit.insertBlock error:', err);
      return null;
    }
  },

  async getAll() {
    if (!pool || !isConnected) return [];
    try {
      const res = await pool.query('SELECT * FROM audit_ledger ORDER BY block_index ASC;');
      return res.rows;
    } catch (err) {
      return [];
    }
  }
};

export const pgDoctors = {
  async insert(doc: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    nmcRegistrationId: string;
    specialty: string;
    qualifications?: string;
    experienceYears?: number;
    hospitalAffiliation?: string;
    department?: string;
    isNmcVerified?: boolean;
    digitalSignatureId?: string;
  }) {
    if (!pool || !isConnected) return null;
    try {
      const q = `
        INSERT INTO doctors (
          id, name, email, phone, nmc_registration_id, specialty, qualifications,
          experience_years, hospital_affiliation, department, is_nmc_verified, digital_signature_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (nmc_registration_id) DO UPDATE SET
          name = EXCLUDED.name,
          specialty = EXCLUDED.specialty,
          hospital_affiliation = EXCLUDED.hospital_affiliation,
          digital_signature_id = EXCLUDED.digital_signature_id
        RETURNING *;
      `;
      const res = await pool.query(q, [
        doc.id,
        doc.name,
        doc.email || null,
        doc.phone || null,
        doc.nmcRegistrationId,
        doc.specialty,
        doc.qualifications || null,
        doc.experienceYears || 5,
        doc.hospitalAffiliation || null,
        doc.department || null,
        doc.isNmcVerified ?? true,
        doc.digitalSignatureId || null
      ]);
      return res.rows[0];
    } catch (err) {
      console.error('pgDoctors.insert error:', err);
      return null;
    }
  },

  async getAll() {
    if (!pool || !isConnected) return [];
    try {
      const res = await pool.query('SELECT * FROM doctors ORDER BY name ASC;');
      return res.rows;
    } catch (err) {
      return [];
    }
  }
};

const FALLBACK_SCHEMA_SQL = `
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
`;

