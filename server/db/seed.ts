import { initPostgres, getPostgresPool, pgAudit } from './postgres';
import { computeAuditHash } from '../security';

async function seed() {
  console.log('🌱 Starting PostgreSQL Seeding for CHIKITSA-X...');
  const init = await initPostgres();

  if (!init.connected) {
    console.log('⚠️ PostgreSQL is not connected. Please ensure DATABASE_URL is defined in .env before running db:seed.');
    process.exit(0);
  }

  const pool = getPostgresPool();
  if (!pool) {
    console.error('No pool available.');
    process.exit(1);
  }

  try {
    // 1. Seed Genesis Audit Block
    const genesisTime = new Date().toISOString();
    const genesisHash = computeAuditHash(0, '0'.repeat(64), genesisTime, 'GENESIS', 'SYSTEM', 'SYSTEM', { desc: 'Chikitsa-X PostgreSQL Ledger Seeded' });
    await pgAudit.insertBlock({
      index: 0,
      timestamp: genesisTime,
      eventType: 'GENESIS',
      actorId: 'SYSTEM',
      actorRole: 'SYSTEM',
      resourceId: 'SYSTEM',
      details: { desc: 'Chikitsa-X PostgreSQL Ledger Genesis Block' },
      previousHash: '0'.repeat(64),
      hash: genesisHash
    });
    console.log('✅ Genesis audit block recorded in PostgreSQL.');

    // 2. Seed Empaneled Hospitals
    const hospitals = [
      {
        id: 'HOSP-01',
        name: 'CarePlus Tertiary Heart & Multi-Specialty Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        type: 'PRIVATE_EMPANELLED',
        rating: 4.8,
        care_score: 94,
        emergency_24x7: true,
        contact_number: '+91 20 6609 9000',
        latitude: 18.5204,
        longitude: 73.8567,
        accepted_schemes: ['Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra', 'Tata Trusts Empanelled', 'CGHS'],
        opd_departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Medicine']
      },
      {
        id: 'HOSP-02',
        name: 'Sanjeevani Charitable Trust Super Specialty Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        type: 'CHARITABLE_TRUST',
        rating: 4.6,
        care_score: 89,
        emergency_24x7: true,
        contact_number: '+91 20 2445 1100',
        latitude: 18.5089,
        longitude: 73.8540,
        accepted_schemes: ['MJPJAY Maharashtra', 'Being Human Foundation', 'Smile Foundation Grant'],
        opd_departments: ['General Medicine', 'Ophthalmology', 'ENT', 'Gynecology']
      },
      {
        id: 'HOSP-04',
        name: 'District Civil & Government Super Specialty Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        type: 'GOVERNMENT',
        rating: 4.7,
        care_score: 92,
        emergency_24x7: true,
        contact_number: '+91 20 2553 4400',
        latitude: 18.5480,
        longitude: 73.7920,
        accepted_schemes: ['100% Free Public Care', 'Ayushman Bharat PM-JAY', 'MJPJAY Maharashtra'],
        opd_departments: ['Emergency Trauma', 'General Medicine', 'Cardiology', 'Orthopedics']
      }
    ];

    for (const h of hospitals) {
      await pool.query(`
        INSERT INTO hospitals (id, name, city, state, type, rating, chikitsa_care_score, emergency_24x7, contact_number, latitude, longitude, accepted_schemes, opd_departments)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING;
      `, [h.id, h.name, h.city, h.state, h.type, h.rating, h.care_score, h.emergency_24x7, h.contact_number, h.latitude, h.longitude, h.accepted_schemes, h.opd_departments]);
    }
    console.log(`✅ ${hospitals.length} empaneled hospitals seeded in PostgreSQL.`);

    // 3. Seed Verified Doctors
    const doctors = [
      {
        id: 'DOC-NMC-2024-01',
        name: 'Dr. Rajesh Kulkarni',
        email: 'rajesh.kulkarni@chikitsax.gov.in',
        phone: '+91 98220 12345',
        nmc_registration_id: 'NMC-2014-45012',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD, DM (Cardiology)',
        experience_years: 14,
        hospital_affiliation: 'CarePlus Tertiary Heart Hospital, Pune',
        department: 'Cardiology',
        is_nmc_verified: true,
        digital_signature_id: 'DSIG-NMC-88341-KUL'
      }
    ];

    for (const d of doctors) {
      await pool.query(`
        INSERT INTO doctors (id, name, email, phone, nmc_registration_id, specialty, qualifications, experience_years, hospital_affiliation, department, is_nmc_verified, digital_signature_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING;
      `, [d.id, d.name, d.email, d.phone, d.nmc_registration_id, d.specialty, d.qualifications, d.experience_years, d.hospital_affiliation, d.department, d.is_nmc_verified, d.digital_signature_id]);
    }
    console.log(`✅ ${doctors.length} verified doctors seeded in PostgreSQL.`);

    console.log('🎉 PostgreSQL Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
