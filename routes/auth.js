import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { dbGet, dbRun } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';
import { generateOTP, sendOTPEmail, sendPasswordResetConfirmationEmail } from '../utils/emailUtils.js';
import { config } from '../config.js';

const router = express.Router();

// Login validation middleware
const loginValidation = [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

// POST /api/auth/login - Admin login
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find user in database
    const user = await dbGet(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // This will be handled by the auth middleware in the main server
    res.json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Forgot password validation middleware
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Return error if user not found (for security, only registered emails should work)
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'No account found with this email address.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000);

    // Store OTP in database
    await dbRun(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expiresAt.toISOString()]
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.username);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive an OTP shortly.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reset password validation middleware
const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// POST /api/auth/reset-password - Reset password with OTP
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, otp, newPassword } = req.body;

    // Find user by email
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or OTP'
      });
    }

    // Find valid OTP
    const resetToken = await dbGet(
      `SELECT * FROM password_reset_tokens 
       WHERE user_id = ? AND token = ? AND used = 0 AND expires_at > ?`,
      [user.id, otp, new Date().toISOString()]
    );

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Mark OTP as used
    await dbRun(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [resetToken.id]
    );

    // Send confirmation email
    const emailResult = await sendPasswordResetConfirmationEmail(user.email, user.username);
    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
    }

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 