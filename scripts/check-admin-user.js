import { dbGet, dbAll, dbRun } from '../database/db.js';

console.log('=== Checking Admin Users ===\n');

// Check current admin users
const users = await dbAll('SELECT * FROM users');
console.log('Current users in database:');
users.forEach(user => {
  console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
});

console.log('\n=== Security Analysis ===');
console.log('Currently, the forgot password system has a security flaw:');
console.log('✗ Any email can be used to reset password');
console.log('✓ Should only work with registered admin emails');

console.log('\n=== Recommended Admin Email ===');
console.log('For security, admin email should be a real email you control:');
console.log('- Option 1: Use your own email (cloudfastmodeng@gmail.com)');
console.log('- Option 2: Create dedicated admin email for this project');

console.log('\nWould you like to update admin email to cloudfastmodeng@gmail.com?');
