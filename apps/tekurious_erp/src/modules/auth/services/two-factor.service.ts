import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret as otplibGenerateSecret, generate as otplibGenerate, verify as otplibVerify } from 'otplib';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

/**
 * otplib v13.4.1 note: the class-based `TOTP`/`HOTP` APIs require explicit
 * crypto/base32 plugin injection (NobleCryptoPlugin/ScureBase32Plugin) or they
 * throw `CryptoPluginMissingError`/`Base32PluginMissingError`. The top-level
 * functional API (`generateSecret`, `generate`, `verify`) ships with sane
 * defaults already wired in and works out of the box, so we use that instead.
 */
@Injectable()
export class TwoFactorService {
  private readonly PERIOD = 30; // 30-second time step
  private readonly DIGITS = 6;

  constructor(private configService: ConfigService) {}

  /**
   * Generate TOTP secret and QR code
   */
  async generateSecret(userEmail: string): Promise<{ secret: string; qrCodeUrl: string }> {
    // Generate secret (base32 encoded)
    const secret = otplibGenerateSecret();

    // Generate OTP auth URL
    const appName = this.configService.get('APP_NAME', 'Tekurious ERP');
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}&period=${this.PERIOD}&digits=${this.DIGITS}`;

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    return {
      secret,
      qrCodeUrl,
    };
  }

  /**
   * Verify TOTP code
   */
  async verifyToken(secret: string, token: string): Promise<boolean> {
    try {
      const result = await otplibVerify({
        token,
        secret,
        period: this.PERIOD,
        digits: this.DIGITS,
        epochTolerance: 1, // Allow ±1 time step (30 seconds each)
      });
      return result.valid;
    } catch (error) {
      throw new BadRequestException('Invalid 2FA code');
    }
  }

  /**
   * Generate current TOTP code (used only for tests/manual verification tooling)
   */
  async generateCurrentToken(secret: string): Promise<string> {
    return otplibGenerate({
      secret,
      period: this.PERIOD,
      digits: this.DIGITS,
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(inputCode: string, hashedCode: string): boolean {
    const inputHash = this.hashBackupCode(inputCode);
    return crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(hashedCode)
    );
  }

  /**
   * Encrypt TOTP secret for storage
   */
  encryptSecret(secret: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt TOTP secret from storage
   */
  decryptSecret(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');

    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
