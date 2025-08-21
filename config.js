import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || join(__dirname, 'database.sqlite')
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Admin Default Credentials
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },

  // Email Configuration for OTP
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    },
    from: process.env.EMAIL_FROM || 'S2 Design Interior <noreply@s2design.com>'
  },

  // OTP Configuration
  otp: {
    expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES) || 10,
    length: parseInt(process.env.OTP_LENGTH) || 6
  }
}; 