# Email Setup Guide for Forgot Password Feature

## Overview
The forgot password feature requires email configuration to send OTP codes to admin users. This guide explains how to set up email functionality.

## Gmail Setup (Recommended)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security > 2-Step Verification
- Enable 2-Step Verification if not already enabled

### 2. Generate App Password
- Go to Security > 2-Step Verification > App passwords
- Select app: "Mail"
- Select device: "Other (custom name)" - enter "S2 Design Admin"
- Copy the generated 16-character password

### 3. Environment Variables
Create a `.env` file in the backend directory with:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=S2 Design Interior <noreply@yourdomain.com>

# OTP Configuration
OTP_EXPIRES_IN_MINUTES=10
OTP_LENGTH=6
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Custom SMTP
```env
EMAIL_SERVICE=
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Testing Email Configuration

### 1. Test Script
Create a test file `test-email.js`:

```javascript
import { sendOTPEmail } from './utils/emailUtils.js';

const testEmail = async () => {
  const result = await sendOTPEmail(
    'test@example.com', 
    '123456', 
    'admin'
  );
  
  console.log('Email test result:', result);
};

testEmail();
```

### 2. Run Test
```bash
node test-email.js
```

## Security Considerations

1. **Never commit .env file to version control**
2. **Use app passwords instead of regular passwords**
3. **Consider using environment-specific email addresses**
4. **Monitor email usage and set up rate limiting if needed**

## Production Deployment

For production, consider:
- Using a dedicated email service (SendGrid, AWS SES, etc.)
- Setting up proper DNS records (SPF, DKIM, DMARC)
- Using a professional email address matching your domain
- Implementing email rate limiting
- Adding email delivery monitoring

## Troubleshooting

### Common Issues:
1. **"Invalid login" error**: Check app password is correct
2. **Connection timeout**: Verify firewall/network settings
3. **Emails going to spam**: Set up proper DNS records
4. **Rate limiting**: Gmail has daily sending limits

### Debug Mode:
Set `NODE_ENV=development` to see detailed email logs in console.
