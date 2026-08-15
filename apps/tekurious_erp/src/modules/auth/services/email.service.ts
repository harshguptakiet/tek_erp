/**
 * Email Service
 * Handles sending authentication-related emails
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private emailEnabled = false;

  constructor(private configService: ConfigService) {
    // Check if email is configured
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');
    const sendgridApiKey = this.configService.get('SENDGRID_API_KEY');

    if (!emailUser && !sendgridApiKey) {
      this.logger.warn('⚠️ Email service not configured - email notifications will be skipped');
      this.logger.warn('Set EMAIL_USER/EMAIL_PASSWORD or SENDGRID_API_KEY to enable email notifications');
      return;
    }

    try {
      // Initialize email transporter
      const emailConfig = sendgridApiKey
        ? {
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: sendgridApiKey,
            },
          }
        : {
            host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
            port: this.configService.get('EMAIL_PORT', 587),
            secure: false,
            auth: {
              user: emailUser,
              pass: emailPassword,
            },
          };

      this.transporter = nodemailer.createTransport(emailConfig);
      this.emailEnabled = true;

      // Verify connection configuration (non-blocking)
      this.transporter.verify((error) => {
        if (error) {
          this.logger.warn('Email service verification failed - emails may not send:', error.message);
          this.emailEnabled = false;
        } else {
          this.logger.log('✅ Email service ready to send messages');
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize email service:', error);
      this.emailEnabled = false;
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping verification email to ${email}`);
      return;
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'Verify Your Email Address - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Tekurious ERP!</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Thank you for signing up! Please verify your email address to activate your account.</p>
                <p>Click the button below to verify your email:</p>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping password reset email to ${email}`);
      return;
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'Reset Your Password - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>We received a request to reset your password for your Tekurious ERP account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetLink}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password won't change until you access the link above</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(email: string, firstName: string): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping password changed notification to ${email}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'Your Password Was Changed - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Changed</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>This is a confirmation that your password was successfully changed on ${new Date().toLocaleString()}.</p>
                <p>All your active sessions have been terminated for security. You'll need to log in again with your new password.</p>
                <div class="warning">
                  <strong>⚠️ Didn't make this change?</strong>
                  <p>If you didn't change your password, your account may be compromised. Please contact support immediately.</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Password changed notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${email}:`, error);
      // Don't throw - this is just a notification
    }
  }

  /**
   * Send account locked notification
   */
  async sendAccountLockedEmail(
    email: string,
    firstName: string,
    duration: string,
    reason: string,
  ): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping account locked notification to ${email}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'Your Account Has Been Locked - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Account Locked</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Your account has been temporarily locked for security reasons.</p>
                <div class="warning">
                  <p><strong>Reason:</strong> ${reason}</p>
                  <p><strong>Duration:</strong> ${duration}</p>
                  <p><strong>Locked at:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>If you believe this was a mistake or need immediate access, please contact support.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Account locked notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account locked email to ${email}:`, error);
      // Don't throw - this is just a notification
    }
  }

  /**
   * Send password expiry reminder (FR-AUTH-019)
   */
  async sendPasswordExpiryReminder(email: string, firstName: string, daysRemaining: number): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping password expiry reminder to ${email}`);
      return;
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const changePasswordLink = `${frontendUrl}/settings/security`;

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: `Password Expiring in ${daysRemaining} Day${daysRemaining > 1 ? 's' : ''} - Tekurious ERP`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Password Expiring Soon</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Your password will expire in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong>.</p>
                <div class="warning">
                  <p><strong>What happens when it expires?</strong></p>
                  <ul>
                    <li>You'll have 3 days grace period to login and change it</li>
                    <li>After the grace period, your account will be locked</li>
                    <li>You'll need to use "Forgot Password" to reset it</li>
                  </ul>
                </div>
                <p>Change your password now to avoid disruption:</p>
                <a href="${changePasswordLink}" class="button">Change Password</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Password expiry reminder sent to ${email} (${daysRemaining} days remaining)`);
    } catch (error) {
      this.logger.error(`Failed to send password expiry reminder to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send login notification (FR-AUTH-036)
   */
  async sendLoginNotification(
    email: string,
    firstName: string,
    deviceInfo: string,
    location: string,
    ipAddress: string,
    loginTime: Date,
  ): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.debug(`Email not configured - skipping login notification to ${email}`);
      return;
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const securitySettingsLink = `${frontendUrl}/settings/security`;

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'New Login to Your Account - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 New Login Detected</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>A new login was detected on your Tekurious ERP account.</p>
                <div class="info-box">
                  <div class="info-row">
                    <span><strong>Device:</strong></span>
                    <span>${deviceInfo}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Location:</strong></span>
                    <span>${location}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>IP Address:</strong></span>
                    <span>${ipAddress}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Time:</strong></span>
                    <span>${loginTime.toLocaleString()}</span>
                  </div>
                </div>
                <p><strong>Was this you?</strong></p>
                <p>If yes, you can ignore this email. If not, your account may be compromised.</p>
                <div class="warning">
                  <p><strong>⚠️ This wasn't you?</strong></p>
                  <p>Take immediate action to secure your account:</p>
                  <ol>
                    <li>Change your password immediately</li>
                    <li>Review your active sessions</li>
                    <li>Enable two-factor authentication if not already enabled</li>
                  </ol>
                </div>
                <a href="${securitySettingsLink}" class="button">Secure My Account</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
                <p>This is an automated security notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Login notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send login notification to ${email}:`, error);
      // Don't throw - this is just a notification
    }
  }

  /**
   * Send account unlocked notification (FR-AUTH-025)
   */
  async sendAccountUnlockedEmail(email: string, firstName: string): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.warn(`Email not configured - skipping account unlocked notification to ${email}`);
      return;
    }

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const loginLink = `${frontendUrl}/auth/login`;

    try {
      await this.transporter.sendMail({
        from: `"Tekurious ERP" <${this.configService.get('EMAIL_FROM', 'noreply@tekurious.com')}>`,
        to: email,
        subject: 'Your Account Has Been Unlocked - Tekurious ERP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Account Unlocked</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Good news! Your account has been unlocked by an administrator and you can now log in.</p>
                <div class="info">
                  <p><strong>What happened?</strong></p>
                  <p>Your account was temporarily locked for security reasons. An administrator has reviewed and unlocked it.</p>
                </div>
                <p>You can now log in to your account:</p>
                <a href="${loginLink}" class="button">Log In Now</a>
                <p><strong>Security tip:</strong> Make sure to use a strong, unique password and enable two-factor authentication for added security.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tekurious ERP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Account unlocked notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account unlocked email to ${email}:`, error);
      // Don't throw - this is just a notification
    }
  }
}
