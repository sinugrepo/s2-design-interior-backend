// Security Enhancement Implementation Guide
// Run: npm install express-rate-limit express-slow-down

import express from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

console.log('🛡️ Security Enhancement Setup Guide\n');

console.log('1. Install required packages:');
console.log('   npm install express-rate-limit express-slow-down\n');

console.log('2. Add these to your server.js:');

console.log(`
// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Apply to auth routes
app.use('/api/auth/login', authLimiter, speedLimiter);
app.use('/api/auth/forgot-password', authLimiter, speedLimiter);
app.use('/api/auth/reset-password', authLimiter, speedLimiter);

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many API requests',
    retryAfter: 15 * 60
  }
});

app.use('/api', apiLimiter);
`);

console.log('\n3. Enhanced security headers:');

console.log(`
// Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
`);

console.log('\n4. Input validation enhancements:');

console.log(`
// Enhanced validation for auth endpoints
const enhancedLoginValidation = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be 1-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password must be 1-128 characters')
];

const enhancedEmailValidation = [
  body('email')
    .isEmail()
    .isLength({ max: 254 })
    .normalizeEmail()
    .withMessage('Valid email required (max 254 characters)')
];
`);

console.log('\n5. Security logging:');

console.log(`
// Security event logging
const logSecurityEvent = (event, req, additional = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ...additional
  };
  
  console.log('SECURITY EVENT:', JSON.stringify(logData));
  
  // In production, send to logging service
  // logger.warn('Security Event', logData);
};

// Usage in auth routes:
// logSecurityEvent('LOGIN_ATTEMPT', req, { username, success: false });
// logSecurityEvent('PASSWORD_RESET_REQUEST', req, { email });
`);

console.log('\n6. Environment validation:');

console.log(`
// Add to config.js
const requiredEnvVars = [
  'JWT_SECRET',
  'EMAIL_USER', 
  'EMAIL_PASSWORD'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(\`❌ Missing required environment variable: \${envVar}\`);
    process.exit(1);
  }
});

// Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters');
  process.exit(1);
}
`);

console.log('\n✅ Implementation complete!');
console.log('📋 Remember to:');
console.log('   1. Test all endpoints after implementing');
console.log('   2. Monitor logs for blocked requests');
console.log('   3. Adjust rate limits based on usage patterns');
console.log('   4. Set up proper logging in production');
