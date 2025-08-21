import nodemailer from 'nodemailer';
import { config } from '../config.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: config.email.service,
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: config.email.auth
  });
};

// Generate OTP
export const generateOTP = (length = config.otp.length) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Send OTP email
export const sendOTPEmail = async (email, otp, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'S2 Design Interior - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">S2 Design Interior</h1>
            <h2 style="color: #666; font-weight: normal;">Password Reset Request</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; margin-bottom: 15px;">Hello <strong>${username}</strong>,</p>
            <p style="color: #333; margin-bottom: 15px;">
              You have requested to reset your password for your admin account. 
              Please use the following OTP (One-Time Password) to proceed:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2c3e50; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; font-size: 14px; margin-bottom: 15px;">
              <li>This OTP is valid for ${config.otp.expiresInMinutes} minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this password reset, please ignore this email</li>
            </ul>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
            <p style="color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} S2 Design Interior. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'S2 Design Interior - Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">S2 Design Interior</h1>
            <h2 style="color: #27ae60; font-weight: normal;">Password Reset Successful</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; margin-bottom: 15px;">Hello <strong>${username}</strong>,</p>
            <p style="color: #333; margin-bottom: 15px;">
              Your password has been successfully reset. You can now log in to your admin account using your new password.
            </p>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>✓ Password Reset Complete</strong>
              <br>
              Your account is now secure with your new password.
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
              If you didn't make this change or if you have any security concerns, please contact support immediately.
            </p>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
            <p style="color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} S2 Design Interior. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return { success: false, error: error.message };
  }
};
