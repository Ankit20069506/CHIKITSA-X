import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// Master Secret Key for AES-256-GCM and HMAC-SHA256
// In production, loaded from process.env.CHIKITSA_MASTER_KEY or KMS vault
const MASTER_ENCRYPTION_KEY = process.env.CHIKITSA_MASTER_KEY || 'chikitsax_aes256_master_key_2026_abdm_secure_32b!';
const JWT_SECRET = process.env.JWT_SECRET || 'chikitsax_jwt_super_secret_signing_key_2026_hs256!';

// Ensure 32-byte (256-bit) buffer for AES-256
function get32ByteKey(rawKey: string): Buffer {
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * 1. AES-256-GCM End-to-End Encryption for Protected Health Information (PHI/FHIR)
 * Provides Confidentiality, Integrity, and Authenticity through Galois/Counter Mode (GCM)
 */
export interface EncryptedDataPayload {
  ciphertext: string; // Base64
  iv: string;         // Base64 (12 bytes)
  tag: string;        // Base64 (16 bytes auth tag)
  algorithm: string;
  timestamp: string;
}

export function encryptPHI(plainTextOrObj: string | object, customKey?: string): EncryptedDataPayload {
  const text = typeof plainTextOrObj === 'object' ? JSON.stringify(plainTextOrObj) : plainTextOrObj;
  const key = get32ByteKey(customKey || MASTER_ENCRYPTION_KEY);
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algorithm: 'AES-256-GCM',
    timestamp: new Date().toISOString()
  };
}

export function decryptPHI(payload: EncryptedDataPayload, customKey?: string): string {
  const key = get32ByteKey(customKey || MASTER_ENCRYPTION_KEY);
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 2. HMAC-SHA256 Cryptographic Audit Ledger
 * Tamper-evident blockchain-style hash chaining for ABDM compliance (M1 KYC, M2 Consent, M3 Records)
 */
export interface AuditBlock {
  index: number;
  timestamp: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  resourceId: string;
  details: any;
  previousHash: string;
  hash: string;
}

export function computeAuditHash(
  index: number,
  prevHash: string,
  timestamp: string,
  eventType: string,
  actorId: string,
  resourceId: string,
  details: any
): string {
  const dataString = `${index}|${prevHash}|${timestamp}|${eventType}|${actorId}|${resourceId}|${JSON.stringify(details)}`;
  return crypto.createHmac('sha256', get32ByteKey(MASTER_ENCRYPTION_KEY)).update(dataString).digest('hex');
}

/**
 * 3. Secure PBKDF2 Password & OTP Hashing with Timing-Safe Verification
 */
export function hashSecret(secret: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(secret, salt, 100000, 64, 'sha512');
  return {
    hash: derivedKey.toString('hex'),
    salt
  };
}

export function verifySecret(secret: string, storedHash: string, salt: string): boolean {
  const derivedKey = crypto.pbkdf2Sync(secret, salt, 100000, 64, 'sha512');
  const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  if (keyBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(keyBuffer, storedBuffer);
}

/**
 * 4. High-Performance Native JWT Generator & Verifier (HS256)
 * Zero external vulnerability, RFC 7519 compliant
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface JWTPayload {
  sub: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN';
  name: string;
  phone?: string;
  email?: string;
  abhaAddress?: string;
  nmcRegistrationId?: string;
  hospitalId?: string;
  exp: number;
  iat: number;
}

export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number = 86400 * 7): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', get32ByteKey(JWT_SECRET))
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', get32ByteKey(JWT_SECRET))
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid token cryptographic signature' };
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}

/**
 * 5. Express Authentication & RBAC Middleware
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Bearer token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const { valid, payload, error } = verifyJWT(token);

  if (!valid || !payload) {
    res.status(403).json({ success: false, error: `Forbidden: ${error || 'Invalid session'}` });
    return;
  }

  req.user = payload;
  next();
}

export function requireRoles(...roles: Array<'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role}' lacks permission. Required: ${roles.join(' or ')}`
      });
      return;
    }

    next();
  };
}
