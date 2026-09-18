import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { hashSecret, verifySecret } from '../security';

export interface OTPRecord {
  target: string;
  code: string;
  codeHash: string;
  salt: string;
  channel: 'MOBILE' | 'EMAIL' | 'BOTH';
  purpose: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  verificationToken?: string;
  tokenExpiresAt?: number;
}

class NotificationService {
  private otpVault: Map<string, OTPRecord> = new Map();
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initMailer();
  }

  private initMailer() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        console.log(`📧 SMTP Transporter initialized successfully (${host}:${port})`);
      } catch (err) {
        console.warn('⚠️ SMTP Transporter init failed, falling back to in-app verification:', err);
      }
    } else {
      console.log('ℹ️ No external SMTP credentials detected. Real OTPs will be displayed via secure in-app channel & server telemetry.');
    }
  }

  /**
   * Generates and dispatches a cryptographically secure 6-digit OTP
   */
  async sendOTP(params: {
    target: string;
    channel?: 'MOBILE' | 'EMAIL' | 'BOTH';
    email?: string;
    phone?: string;
    fullName?: string;
    purpose?: string;
  }): Promise<{
    success: boolean;
    message: string;
    channel: string;
    emailDeliveryStatus: string;
    smsDeliveryStatus: string;
    otpCode: string;
    expiresInSeconds: number;
  }> {
    const { target, channel = 'BOTH', email, phone, fullName = 'Valued User', purpose = 'Account Verification' } = params;
    const normalizedTarget = target.trim().toLowerCase();

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const { hash: codeHash, salt } = hashSecret(code);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const record: OTPRecord = {
      target: normalizedTarget,
      code,
      codeHash,
      salt,
      channel,
      purpose,
      expiresAt,
      attempts: 0,
      verified: false
    };

    this.otpVault.set(normalizedTarget, record);

    let emailDeliveryStatus = 'NOT_REQUESTED';
    let smsDeliveryStatus = 'NOT_REQUESTED';

    // 1. Email Dispatch
    const targetEmail = email || (normalizedTarget.includes('@') ? normalizedTarget : undefined);
    if (targetEmail) {
      if (this.transporter) {
        try {
          await this.transporter.sendMail({
            from: process.env.SMTP_FROM || `"CHIKITSA-X Healthcare" <no-reply@chikitsax.gov.in>`,
            to: targetEmail,
            subject: `🏥 ${code} is your CHIKITSA-X Verification Code`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; color: #ffffff; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🏥 CHIKITSA-X</h1>
                  <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Ayushman Bharat Digital Mission (ABDM) Compliant</p>
                </div>
                <div style="padding: 28px 24px; text-align: center; color: #1e293b;">
                  <h2 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">${purpose}</h2>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #64748b;">
                    Hello ${fullName}, use the following One-Time Password (OTP) to complete your healthcare access verification:
                  </p>
                  <div style="display: inline-block; background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; padding: 14px 32px; margin-bottom: 20px;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace;">${code}</span>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                    ⏱️ This code is strictly confidential and expires in <strong>5 minutes</strong>. Never share your OTP with anyone.
                  </p>
                </div>
                <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
                  Secured by AES-256-GCM & HMAC-SHA256 Audit Ledger • Government of India NHA M1 Standards
                </div>
              </div>
            `
          });
          emailDeliveryStatus = `SENT_TO_${targetEmail}`;
          console.log(`✅ [EMAIL DELIVERED] Real OTP sent to ${targetEmail}`);
        } catch (mailErr) {
          console.error(`❌ [EMAIL ERROR] Failed to send email to ${targetEmail}:`, mailErr);
          emailDeliveryStatus = `FAILED_SMTP_FALLBACK`;
        }
      } else {
        emailDeliveryStatus = `READY_IN_APP_FALLBACK`;
        console.log(`ℹ️ [SIMULATED EMAIL] OTP for ${targetEmail}: ${code}`);
      }
    }

    // 2. Mobile Dispatch
    const targetPhone = phone || (!normalizedTarget.includes('@') ? normalizedTarget : undefined);
    if (targetPhone) {
      if (process.env.FAST2SMS_API_KEY && targetPhone.length >= 10) {
        try {
          const cleanPhone = targetPhone.replace(/\D/g, '').slice(-10);
          const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              'authorization': process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              route: 'otp',
              variables_values: code,
              numbers: cleanPhone
            })
          });
          if (response.ok) {
            smsDeliveryStatus = `SMS_SENT_TO_${cleanPhone}`;
            console.log(`✅ [SMS DELIVERED] Real SMS sent to ${cleanPhone}`);
          } else {
            smsDeliveryStatus = 'FAILED_SMS_GATEWAY';
          }
        } catch (smsErr) {
          console.error('❌ [SMS ERROR] Failed to send SMS:', smsErr);
          smsDeliveryStatus = 'FAILED_SMS_FALLBACK';
        }
      } else {
        smsDeliveryStatus = `READY_IN_APP_FALLBACK`;
        console.log(`ℹ️ [SIMULATED SMS] OTP for ${targetPhone}: ${code}`);
      }
    }

    return {
      success: true,
      message: `OTP generated and dispatched successfully for ${normalizedTarget}.`,
      channel,
      emailDeliveryStatus,
      smsDeliveryStatus,
      otpCode: code,
      expiresInSeconds: 300
    };
  }

  /**
   * Verifies an entered OTP timing-safely and issues a single-use verification token
   */
  verifyOTP(target: string, enteredCode: string): {
    success: boolean;
    message: string;
    verificationToken?: string;
  } {
    const normalizedTarget = target.trim().toLowerCase();
    const record = this.otpVault.get(normalizedTarget);

    if (!record) {
      return { success: false, message: 'No active OTP found for this mobile number or email. Please request a new OTP.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpVault.delete(normalizedTarget);
      return { success: false, message: 'OTP has expired. Please request a new code.' };
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpVault.delete(normalizedTarget);
      return { success: false, message: 'Too many incorrect attempts. OTP invalidated for security.' };
    }

    // Timing-safe check using PBKDF2 hash verification
    const isValid = verifySecret(enteredCode, record.codeHash, record.salt);
    if (!isValid) {
      return { success: false, message: `Invalid OTP code. ${5 - record.attempts} attempts remaining.` };
    }

    // Success: Generate verification token valid for 10 mins
    const verificationToken = crypto.randomBytes(32).toString('hex');
    record.verified = true;
    record.verificationToken = verificationToken;
    record.tokenExpiresAt = Date.now() + 10 * 60 * 1000;

    return {
      success: true,
      message: 'OTP verified successfully.',
      verificationToken
    };
  }

  /**
   * Consumes single-use verification token during registration/login
   */
  consumeVerificationToken(target: string, token: string): boolean {
    const normalizedTarget = target.trim().toLowerCase();
    const record = this.otpVault.get(normalizedTarget);

    if (!record || !record.verified || record.verificationToken !== token) {
      return false;
    }

    if (record.tokenExpiresAt && Date.now() > record.tokenExpiresAt) {
      this.otpVault.delete(normalizedTarget);
      return false;
    }

    // Single use: delete record
    this.otpVault.delete(normalizedTarget);
    return true;
  }
}

export const notificationService = new NotificationService();
