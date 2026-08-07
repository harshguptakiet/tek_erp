/**
 * Authentication Test Script with Account Activation
 * Tests complete auth flow including account activation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3333/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70));
}

async function testAuthFlow() {
  section('🧪 TEKURIOUS AUTH FLOW TEST');
  
  log('This test will:', 'cyan');
  console.log('1. Register a new user');
  console.log('2. Show the account status issue');
  console.log('3. Provide solutions\n');
  
  // Step 1: Register
  section('STEP 1: Register New User');
  
  const testUser = {
    email: `test${Date.now()}@tekurious.com`,
    password: 'Test@12345',
    firstName: 'Test',
    lastName: 'User',
  };
  
  log('Test credentials:', 'blue');
  console.log('  Email:', testUser.email);
  console.log('  Password:', testUser.password);
  console.log('');
  
  let registerResponse;
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, testUser, {
      validateStatus: () => true,
    });
    
    if (response.status === 201) {
      log('✅ Registration successful!', 'green');
      registerResponse = response.data;
      console.log('');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      log('❌ Registration failed', 'red');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return;
    }
  } catch (error) {
    log('❌ Registration request failed', 'red');
    console.log('Error:', error.message);
    return;
  }
  
  // Step 2: Attempt Login
  section('STEP 2: Attempt Login with New Account');
  
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: testUser.email,
        password: testUser.password,
      },
      {
        validateStatus: () => true,
      }
    );
    
    if (response.status === 200) {
      log('✅ Login successful!', 'green');
      console.log('');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      log('❌ Login failed (Expected)', 'yellow');
      console.log('Status:', response.status);
      console.log('Error:', response.data.message);
      console.log('');
      log('⚠️  ISSUE IDENTIFIED:', 'yellow');
      console.log('   Account status is: ' + registerResponse.user.status);
      console.log('   Login requires status: ACTIVE');
      console.log('   Current status: ' + registerResponse.user.status);
    }
  } catch (error) {
    log('❌ Login request failed', 'red');
    console.log('Error:', error.message);
  }
  
  // Solutions
  section('🔧 SOLUTIONS');
  
  log('Option 1: Auto-activate accounts on registration (Development Only)', 'cyan');
  console.log('  Modify: apps/tekurious_erp/src/modules/auth/auth.service.ts');
  console.log('  Line ~48: Change status from PENDING_VERIFICATION to ACTIVE');
  console.log('');
  log('  status: \'ACTIVE\',  // Changed from PENDING_VERIFICATION', 'yellow');
  console.log('');
  
  log('Option 2: Manually activate in database', 'cyan');
  console.log('  Run this SQL query:');
  console.log('');
  log(`  UPDATE users SET status = 'ACTIVE', "emailVerified" = true WHERE email = '${testUser.email}';`, 'yellow');
  console.log('');
  console.log('  Then try logging in again.');
  console.log('');
  
  log('Option 3: Implement email verification flow', 'cyan');
  console.log('  1. Add email service configuration');
  console.log('  2. Implement /auth/verify-email endpoint');
  console.log('  3. Send verification email on registration');
  console.log('  4. User clicks link to verify');
  console.log('');
  
  log('Option 4: Use existing ACTIVE account', 'cyan');
  console.log('  Check your database for users with status = ACTIVE:');
  console.log('');
  log('  SELECT email, status FROM users WHERE status = \'ACTIVE\' LIMIT 5;', 'yellow');
  console.log('');
  
  // Quick fix suggestion
  section('⚡ QUICK FIX FOR DEVELOPMENT');
  log('Copy and paste this code into your auth.service.ts:', 'green');
  console.log('');
  log('Line ~48 in register() method:', 'blue');
  console.log('');
  console.log('// OLD:');
  log('status: \'PENDING_VERIFICATION\',', 'red');
  console.log('');
  console.log('// NEW:');
  log('status: process.env.NODE_ENV === \'production\' ? \'PENDING_VERIFICATION\' : \'ACTIVE\',', 'green');
  console.log('');
  log('This will auto-activate users in development while requiring verification in production.', 'cyan');
  
  section('📝 FRONTEND FIX NEEDED');
  log('The frontend auth hook is working correctly!', 'green');
  log('The issue is purely backend account activation logic.', 'green');
  console.log('');
  log('After fixing the backend, test with:', 'cyan');
  console.log('');
  log(`node test-auth-with-activation.js login ${testUser.email} ${testUser.password}`, 'yellow');
  console.log('');
}

// Manual login test
async function testLoginOnly(email, password) {
  section('🔐 MANUAL LOGIN TEST');
  
  console.log('Email:', email);
  console.log('Password: ***hidden***');
  console.log('');
  
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      {
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    if (response.status === 200) {
      log('✅ LOGIN SUCCESSFUL!', 'green');
      console.log('');
      log('Response Structure:', 'blue');
      console.log('  - accessToken:', typeof response.data.accessToken);
      console.log('  - user:', typeof response.data.user);
      console.log('');
      log('Access Token (first 50 chars):', 'blue');
      console.log('  ' + response.data.accessToken.substring(0, 50) + '...');
      console.log('');
      log('User Info:', 'blue');
      console.log(JSON.stringify(response.data.user, null, 2));
      console.log('');
      log('✅ Frontend auth will work with this response structure!', 'green');
    } else {
      log('❌ LOGIN FAILED', 'red');
      console.log('Status:', response.status);
      console.log('Error:', response.data.message || response.data);
      console.log('');
      
      if (response.data.message?.includes('inactive')) {
        log('⚠️  Account needs to be activated', 'yellow');
        console.log('Run this SQL to activate:');
        console.log('');
        log(`UPDATE users SET status = 'ACTIVE', "emailVerified" = true WHERE email = '${email}';`, 'yellow');
      }
    }
  } catch (error) {
    log('❌ REQUEST FAILED', 'red');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Check backend fix
async function checkBackendFix() {
  section('🔍 CHECK BACKEND FIX STATUS');
  
  log('Registering test user to check if auto-activation is enabled...', 'blue');
  
  const testUser = {
    email: `check${Date.now()}@tekurious.com`,
    password: 'Test@12345',
    firstName: 'Check',
    lastName: 'User',
  };
  
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, testUser, {
      validateStatus: () => true,
    });
    
    if (response.status === 201) {
      const status = response.data.user.status;
      console.log('');
      console.log('New user status:', status);
      console.log('');
      
      if (status === 'ACTIVE') {
        log('✅ AUTO-ACTIVATION IS ENABLED!', 'green');
        log('Users can now login immediately after registration.', 'green');
        
        // Try login
        console.log('');
        log('Testing immediate login...', 'blue');
        const loginResponse = await axios.post(
          `${API_BASE}/auth/login`,
          {
            email: testUser.email,
            password: testUser.password,
          },
          { validateStatus: () => true }
        );
        
        if (loginResponse.status === 200) {
          log('✅ LOGIN WORKS! Backend fix is complete!', 'green');
        } else {
          log('❌ Login still fails. Check backend logs.', 'red');
          console.log('Error:', loginResponse.data);
        }
      } else {
        log('⚠️  Auto-activation NOT enabled', 'yellow');
        log(`Current status: ${status}`, 'yellow');
        log('Apply the backend fix from the solutions above.', 'cyan');
      }
    }
  } catch (error) {
    log('❌ Check failed', 'red');
    console.log('Error:', error.message);
  }
}

// CLI
const command = process.argv[2];

if (command === 'login' && process.argv[3] && process.argv[4]) {
  testLoginOnly(process.argv[3], process.argv[4]);
} else if (command === 'check') {
  checkBackendFix();
} else {
  testAuthFlow();
}
