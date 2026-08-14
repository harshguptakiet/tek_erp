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
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    const emailConfig = {
      host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email service initialization failed:', error);
      } else {
        this.logger.log('✅ Email service ready to send messages');
      }
    });
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
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
}
