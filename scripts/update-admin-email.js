import { dbGet, dbAll, dbRun } from '../database/db.js';

console.log('=== Updating Admin Email for Security ===\n');

try {
  // Check current admin users
  const users = await dbAll('SELECT * FROM users');
  console.log('Current users in database:');
  users.forEach(user => {
    console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email || 'NULL'}, Role: ${user.role}`);
  });

  // Update admin email to your email
  const result = await dbRun(
    'UPDATE users SET email = ? WHERE username = ? AND role = ?',
    ['cloudfastmodeng@gmail.com', 'admin', 'admin']
  );

  console.log('\n✅ Admin email updated successfully!');
  console.log('Admin email changed to: cloudfastmodeng@gmail.com');

  // Verify update
  const adminUser = await dbGet('SELECT * FROM users WHERE username = ?', ['admin']);
  console.log('\nUpdated admin user:');
  console.log(`- Username: ${adminUser.username}`);
  console.log(`- Email: ${adminUser.email}`);
  console.log(`- Role: ${adminUser.role}`);

  console.log('\n=== Security Improvement ===');
  console.log('✅ Now forgot password will ONLY work with: cloudfastmodeng@gmail.com');
  console.log('✅ Any other email will get "email not found" response');
  
} catch (error) {
  console.error('Error updating admin email:', error);
}
