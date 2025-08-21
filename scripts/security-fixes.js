import { dbRun, dbGet } from '../database/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

console.log('🔒 Implementing Critical Security Fixes...\n');

async function generateSecurePassword() {
  // Generate secure password
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

async function securityFixes() {
  try {
    console.log('1. 🔐 Generating new secure admin password...');
    
    // Generate new secure password
    const newPassword = await generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin password
    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND role = ?',
      [hashedPassword, 'admin', 'admin']
    );
    
    console.log('✅ Admin password updated successfully!');
    console.log(`   New Password: ${newPassword}`);
    console.log('   ⚠️  SAVE THIS PASSWORD SECURELY!');
    
    console.log('\n2. 🔑 Generating secure JWT secret...');
    
    // Generate secure JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    console.log('✅ JWT Secret generated!');
    console.log(`   Add to .env file:`);
    console.log(`   JWT_SECRET=${jwtSecret}`);
    
    console.log('\n3. 🛡️ Security recommendations applied:');
    console.log('   ✅ Strong password with 16 characters');
    console.log('   ✅ bcrypt rounds increased to 12');
    console.log('   ✅ Cryptographically secure JWT secret');
    
    console.log('\n4. 📋 Next steps:');
    console.log('   1. Update .env file with new JWT_SECRET');
    console.log('   2. Restart server to apply JWT secret');
    console.log('   3. Test login with new password');
    console.log('   4. Implement rate limiting (see security-enhancements.js)');
    
    // Verify the update
    const adminUser = await dbGet('SELECT username, email, updated_at FROM users WHERE username = ?', ['admin']);
    console.log('\n✅ Verification:');
    console.log(`   Admin: ${adminUser.username} (${adminUser.email})`);
    console.log(`   Updated: ${adminUser.updated_at}`);
    
  } catch (error) {
    console.error('❌ Error applying security fixes:', error);
  }
}

securityFixes();
