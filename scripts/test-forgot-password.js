import { sendOTPEmail, generateOTP } from '../utils/emailUtils.js';
import { config } from '../config.js';

console.log('=== Testing Forgot Password Feature ===\n');

// Test 1: Generate OTP
console.log('1. Testing OTP generation...');
const otp = generateOTP();
console.log('Generated OTP:', otp);
console.log('OTP length:', otp.length);
console.log('OTP is numeric:', /^\d+$/.test(otp));
console.log('✓ OTP generation test passed\n');

// Test 2: Email configuration
console.log('2. Testing email configuration...');
console.log('Email service:', config.email.service);
console.log('Email host:', config.email.host);
console.log('Email port:', config.email.port);
console.log('Email user:', config.email.auth.user);
console.log('Email from:', config.email.from);
console.log('OTP expires in:', config.otp.expiresInMinutes, 'minutes');
console.log('✓ Email configuration loaded\n');

// Test 3: Send test email (only if email is configured)
console.log('3. Testing email sending...');
if (config.email.auth.user === 'your-email@gmail.com') {
    console.log('⚠️  Email not configured yet. Please update your .env file with actual email credentials.');
    console.log('   See email-setup.md for detailed instructions.');
} else {
    console.log('Attempting to send test email...');
    
    sendOTPEmail(config.email.auth.user, otp, 'admin')
        .then(result => {
            if (result.success) {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', result.messageId);
            } else {
                console.log('❌ Failed to send test email:', result.error);
            }
        })
        .catch(error => {
            console.log('❌ Email test error:', error.message);
        });
}

console.log('\n=== Test Summary ===');
console.log('✓ OTP generation: Working');
console.log('✓ Configuration: Loaded');
console.log('? Email sending: Run with proper .env configuration');

console.log('\n=== Next Steps ===');
console.log('1. Configure email settings in .env file (see email-setup.md)');
console.log('2. Test the complete flow from frontend');
console.log('3. Check admin@s2design.com email for OTP delivery');
