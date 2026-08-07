/**
 * Authentication Test Script
 * Tests backend auth endpoints directly
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3333/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function testBackendHealth() {
  section('TEST 1: Backend Health Check');
  try {
    // Try the auth endpoint instead since there's no health endpoint
    const response = await axios.get(`${API_BASE}/auth/login`, {
      timeout: 5000,
      validateStatus: () => true, // Accept any status
    });
    
    // Any response means backend is running
    log('✅ Backend is running', 'green');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Backend is NOT responding', 'red');
      log('   Connection refused - Backend server is not running on port 3333', 'red');
      return false;
    } else if (error.response) {
      // Got a response, so server is running
      log('✅ Backend is running', 'green');
      console.log('Status:', error.response.status);
      return true;
    } else {
      log('❌ Cannot connect to backend', 'red');
      console.log('   Error:', error.message);
      return false;
    }
  }
}

async function testAuthEndpointExists() {
  section('TEST 2: Auth Login Endpoint Check');
  try {
    // Try with empty body to see if endpoint exists
    const response = await axios.post(`${API_BASE}/auth/login`, {}, {
      timeout: 5000,
      validateStatus: () => true, // Accept any status
    });
    
    if (response.status === 400 || response.status === 401) {
      log('✅ Auth endpoint exists (returned validation error as expected)', 'green');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return true;
    } else {
      log('⚠️  Unexpected response from auth endpoint', 'yellow');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return true;
    }
  } catch (error) {
    if (error.response) {
      log('✅ Auth endpoint exists (returned error response)', 'green');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      return true;
    } else {
      log('❌ Cannot reach auth endpoint', 'red');
      console.log('Error:', error.message);
      return false;
    }
  }
}

async function testRegisterEndpoint() {
  section('TEST 3: Register Test User');
  
  const testUser = {
    email: `test${Date.now()}@tekurious.com`,
    password: 'Test@12345',
    firstName: 'Test',
    lastName: 'User',
  };
  
  console.log('Test user data:', testUser);
  
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, testUser, {
      timeout: 10000,
      validateStatus: () => true,
    });
    
    if (response.status === 200 || response.status === 201) {
      log('✅ Registration successful', 'green');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      return { success: true, user: testUser, data: response.data };
    } else {
      log('⚠️  Registration returned non-success status', 'yellow');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return { success: false, user: testUser };
    }
  } catch (error) {
    log('❌ Registration failed', 'red');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, user: testUser };
  }
}

async function testLogin(credentials) {
  section('TEST 4: Login Test');
  
  console.log('Login credentials:', {
    email: credentials.email,
    password: '***hidden***',
  });
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200 || response.status === 201) {
      log('✅ Login successful', 'green');
      console.log('Response status:', response.status);
      console.log('Response structure:', Object.keys(response.data));
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      
      // Check response structure
      if (response.data.accessToken) {
        log('  ✅ Has accessToken', 'green');
      } else {
        log('  ❌ Missing accessToken', 'red');
      }
      
      if (response.data.user) {
        log('  ✅ Has user object', 'green');
        console.log('  User fields:', Object.keys(response.data.user));
      } else {
        log('  ❌ Missing user object', 'red');
      }
      
      return { success: true, data: response.data };
    } else {
      log('❌ Login failed', 'red');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    log('❌ Login request failed', 'red');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return { success: false, error: error.message };
  }
}

async function testCORS() {
  section('TEST 5: CORS Configuration');
  try {
    const response = await axios.options(`${API_BASE}/auth/login`, {
      headers: {
        'Origin': FRONTEND_BASE,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
      timeout: 5000,
    });
    
    log('✅ CORS preflight successful', 'green');
    console.log('Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('Access-Control-Allow-Credentials:', response.headers['access-control-allow-credentials']);
    return true;
  } catch (error) {
    log('⚠️  CORS check failed (might be OK if endpoint handles it differently)', 'yellow');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function testFrontendAccess() {
  section('TEST 6: Frontend Accessibility');
  try {
    const response = await axios.get(FRONTEND_BASE, {
      timeout: 5000,
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      return true;
    } else {
      log('⚠️  Frontend returned non-200 status', 'yellow');
      console.log('Status:', response.status);
      return false;
    }
  } catch (error) {
    log('❌ Cannot access frontend', 'red');
    console.log('Error:', error.message);
    return false;
  }
}

async function checkDatabaseUsers() {
  section('TEST 7: Check for Existing Users');
  log('ℹ️  Manual check required:', 'blue');
  console.log('Run this query in your database to see existing users:');
  console.log('');
  log('SELECT id, email, "firstName", "lastName", status FROM users LIMIT 5;', 'yellow');
  console.log('');
  log('Or use an existing test user if you have one.', 'blue');
}

async function runAllTests() {
  log('\n🚀 Starting Tekurious Auth Test Suite\n', 'bright');
  log(`Backend: ${API_BASE}`, 'blue');
  log(`Frontend: ${FRONTEND_BASE}`, 'blue');
  
  const results = {
    backendHealth: false,
    authEndpoint: false,
    cors: false,
    frontend: false,
    register: null,
    login: null,
  };
  
  // Test 1: Backend Health
  results.backendHealth = await testBackendHealth();
  if (!results.backendHealth) {
    log('\n❌ CRITICAL: Backend is not running. Please start it first.', 'red');
    log('Run: node start-backend.js', 'yellow');
    return;
  }
  
  // Test 2: Auth Endpoint
  results.authEndpoint = await testAuthEndpointExists();
  if (!results.authEndpoint) {
    log('\n❌ CRITICAL: Auth endpoint not found', 'red');
    return;
  }
  
  // Test 5: CORS
  results.cors = await testCORS();
  
  // Test 6: Frontend
  results.frontend = await testFrontendAccess();
  
  // Test 7: Database users
  await checkDatabaseUsers();
  
  // Test 3 & 4: Register and Login
  section('TEST 3 & 4: Full Auth Flow');
  log('Creating a new test user and attempting login...', 'blue');
  
  results.register = await testRegisterEndpoint();
  
  if (results.register.success) {
    // Wait a moment for database
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to login with the registered user
    results.login = await testLogin({
      email: results.register.user.email,
      password: results.register.user.password,
    });
  } else {
    log('\n⚠️  Skipping login test since registration failed', 'yellow');
    log('You can still test with an existing user:', 'blue');
    console.log('');
    log('node test-auth.js login test@example.com password123', 'yellow');
  }
  
  // Summary
  section('TEST SUMMARY');
  console.log('Backend Health:    ', results.backendHealth ? '✅' : '❌');
  console.log('Auth Endpoint:     ', results.authEndpoint ? '✅' : '❌');
  console.log('CORS Config:       ', results.cors ? '✅' : '⚠️');
  console.log('Frontend Access:   ', results.frontend ? '✅' : '❌');
  console.log('Registration:      ', results.register?.success ? '✅' : '❌');
  console.log('Login:             ', results.login?.success ? '✅' : '❌');
  
  if (results.login?.success) {
    section('✅ ALL TESTS PASSED!');
    log('Your authentication system is working correctly.', 'green');
    log('\nResponse structure from backend:', 'blue');
    console.log(JSON.stringify(results.login.data, null, 2));
  } else {
    section('⚠️  ISSUES DETECTED');
    log('Review the test results above to identify the problem.', 'yellow');
  }
}

// CLI support for manual testing
if (process.argv[2] === 'login' && process.argv[3] && process.argv[4]) {
  section('MANUAL LOGIN TEST');
  testLogin({
    email: process.argv[3],
    password: process.argv[4],
  }).then(() => process.exit(0));
} else if (process.argv[2] === 'register') {
  testRegisterEndpoint().then(() => process.exit(0));
} else {
  // Run full test suite
  runAllTests().then(() => {
    console.log('\n');
  }).catch(error => {
    log('\n❌ Test suite crashed:', 'red');
    console.error(error);
    process.exit(1);
  });
}
