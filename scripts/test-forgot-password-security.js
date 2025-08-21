console.log('=== Testing Forgot Password Security ===\n');

const API_BASE = 'http://localhost:3001/api';

async function testForgotPassword(email, description) {
  console.log(`\n${description}`);
  console.log(`Testing email: ${email}`);
  
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.ok) {
      console.log('✅ OTP should be sent to this email');
    } else {
      console.log('❌ Email rejected (security working)');
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Test cases
console.log('Starting security tests...');

await testForgotPassword(
  'random@example.com', 
  '1. Testing with UNREGISTERED email (should fail):'
);

await testForgotPassword(
  'cloudfastmodeng@gmail.com', 
  '2. Testing with REGISTERED admin email (should succeed):'
);

await testForgotPassword(
  'admin@s2design.com', 
  '3. Testing with OLD admin email (should fail):'
);

console.log('\n=== Security Summary ===');
console.log('✅ Only cloudfastmodeng@gmail.com should receive OTP');
console.log('✅ All other emails should be rejected');
console.log('✅ This prevents unauthorized password resets');
