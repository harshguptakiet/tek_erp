import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import * as crypto from 'crypto';

interface OtpRecord {
  otp: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStore = new Map<string, OtpRecord>();
  private readonly maxAttempts = 3;
  private readonly otpValidityMinutes = 10;

  constructor(
    private configService: ConfigService,
    private smsService: SmsService,
  ) {
    // Cleanup expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpiredOtps(), 5 * 60 * 1000);
  }

  /**
   * Generate and send OTP to phone number
   */
  async sendOtp(phone: string): Promise<void> {
    // Check rate limiting (3 OTP requests per hour per phone)
    const existingOtp = this.otpStore.get(phone);
    if (existingOtp && existingOtp.expiresAt > new Date()) {
      const minutesRemaining = Math.ceil(
        (existingOtp.expiresAt.getTime() - Date.now()) / (60 * 1000)
      );
      throw new BadRequestException(
        `OTP already sent. Please wait ${minutesRemaining} minutes or use existing OTP.`
      );
    }

    // Generate 6-digit OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.otpValidityMinutes * 60 * 1000);

    // Store OTP
    this.otpStore.set(phone, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send SMS (TODO: Integrate with Twilio/similar service)
    await this.sendSms(phone, otp);

    this.logger.log(`OTP sent to ${phone}: ${otp} (DEV MODE - expires in ${this.otpValidityMinutes} min)`);
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const record = this.otpStore.get(phone);

    if (!record) {
      throw new BadRequestException('No OTP found for this phone number');
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // Check max attempts
    if (record.attempts >= this.maxAttempts) {
      this.otpStore.delete(phone);
      throw new BadRequestException('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Verify OTP
    if (record.otp !== otp) {
      record.attempts++;
      throw new BadRequestException(
        `Invalid OTP. ${this.maxAttempts - record.attempts} attempts remaining.`
      );
    }

    // OTP verified successfully - remove from store
    this.otpStore.delete(phone);
    return true;
  }

  /**
   * Generate random 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send SMS via SMS service (Twilio, AWS SNS, or Console)
   */
  private async sendSms(phone: string, otp: string): Promise<void> {
    const success = await this.smsService.sendOtp(phone, otp);
    
    if (!success) {
      this.logger.error(`Failed to send OTP via SMS to ${phone}`);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
    
    this.logger.log(`OTP sent to ${phone} via SMS service (expires in ${this.otpValidityMinutes} min)`);
  }

  /**
   * Cleanup expired OTPs
   */
  private cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [phone, record] of this.otpStore.entries()) {
      if (record.expiresAt < now) {
        this.otpStore.delete(phone);
      }
    }
  }
}
