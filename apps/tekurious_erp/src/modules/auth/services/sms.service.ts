/**
 * SMS Service
 * Handles sending SMS messages (OTP, notifications)
 * Supports multiple providers: Twilio (default), AWS SNS
 * FR-AUTH-002, FR-AUTH-024: Phone OTP Verification
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<boolean>;
}

/**
 * Twilio SMS Provider
 */
class TwilioProvider implements SmsProvider {
  private readonly logger = new Logger('TwilioProvider');
  private client: any;

  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string,
  ) {
    // Lazy load Twilio SDK
    try {
      const twilio = require('twilio');
      this.client = twilio(accountSid, authToken);
      this.logger.log('✅ Twilio SMS provider initialized');
    } catch (error) {
      this.logger.warn(
        '⚠️ Twilio SDK not installed. Run: npm install twilio',
      );
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      this.logger.error('Twilio client not initialized');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      this.logger.log(`SMS sent via Twilio: ${result.sid} to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Twilio SMS failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * AWS SNS SMS Provider
 */
class AwsSnsProvider implements SmsProvider {
  private readonly logger = new Logger('AwsSnsProvider');
  private sns: any;

  constructor(
    private region: string,
    private accessKeyId: string,
    private secretAccessKey: string,
  ) {
    // Lazy load AWS SDK
    try {
      const AWS = require('aws-sdk');
      AWS.config.update({
        region: this.region,
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      });
      this.sns = new AWS.SNS({ apiVersion: '2010-03-31' });
      this.logger.log('✅ AWS SNS provider initialized');
    } catch (error) {
      this.logger.warn('⚠️ AWS SDK not installed. Run: npm install aws-sdk');
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.sns) {
      this.logger.error('AWS SNS client not initialized');
      return false;
    }

    try {
      const params = {
        Message: message,
        PhoneNumber: to,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      };

      const result = await this.sns.publish(params).promise();
      this.logger.log(`SMS sent via AWS SNS: ${result.MessageId} to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`AWS SNS SMS failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Console SMS Provider (for development/testing)
 */
class ConsoleProvider implements SmsProvider {
  private readonly logger = new Logger('ConsoleSmsProvider');

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`
╔════════════════════════════════════════════════════════════
║ 📱 SMS (CONSOLE MODE - DEV ONLY)
║ To: ${to}
║ Message: ${message}
╚════════════════════════════════════════════════════════════
    `);
    return true;
  }
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private provider: SmsProvider;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
  }

  /**
   * Initialize SMS provider based on configuration
   */
  private initializeProvider(): void {
    const smsProvider = this.configService.get<string>(
      'SMS_PROVIDER',
      'console',
    );

    switch (smsProvider.toLowerCase()) {
      case 'twilio':
        this.provider = new TwilioProvider(
          this.configService.get<string>('TWILIO_ACCOUNT_SID', ''),
          this.configService.get<string>('TWILIO_AUTH_TOKEN', ''),
          this.configService.get<string>('TWILIO_PHONE_NUMBER', ''),
        );
        break;

      case 'aws':
      case 'sns':
        this.provider = new AwsSnsProvider(
          this.configService.get<string>('AWS_REGION', 'us-east-1'),
          this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        );
        break;

      case 'console':
      default:
        this.provider = new ConsoleProvider();
        this.logger.warn(
          '⚠️ Using CONSOLE SMS provider (dev mode). Set SMS_PROVIDER=twilio for production',
        );
        break;
    }
  }

  /**
   * Send OTP via SMS
   * @param phone - Phone number (E.164 format: +1234567890)
   * @param otp - OTP code
   */
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `Your Tekurious ERP verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send generic SMS
   * @param phone - Phone number (E.164 format)
   * @param message - Message content
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    // Validate phone number format (basic)
    if (!phone || !phone.startsWith('+')) {
      this.logger.error(
        `Invalid phone number format: ${phone}. Must start with + (E.164)`,
      );
      return false;
    }

    try {
      return await this.provider.sendSms(phone, message);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      return false;
    }
  }

  /**
   * Send phone verification SMS
   * @param phone - Phone number
   * @param verificationLink - Link to verify phone
   */
  async sendPhoneVerification(
    phone: string,
    verificationCode: string,
  ): Promise<boolean> {
    const message = `Welcome to Tekurious ERP! Your phone verification code is: ${verificationCode}. Valid for 15 minutes.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send account locked notification via SMS
   * @param phone - Phone number
   * @param reason - Lock reason
   */
  async sendAccountLockedSms(phone: string, reason: string): Promise<boolean> {
    const message = `Your Tekurious ERP account has been locked. Reason: ${reason}. Contact support if you need assistance.`;
    return this.sendSms(phone, message);
  }
}
