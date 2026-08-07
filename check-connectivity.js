/**
 * Connectivity Checker
 * Quickly verify backend/frontend connectivity
 */

const http = require('http');

const BACKEND_PORT = 3333;
const FRONTEND_PORT = 3000;
const DB_HOST = 'localhost';
const DB_PORT = 5432;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function checkPort(host, port, name) {
  return new Promise((resolve) => {
    const client = require('net').Socket();
    client.setTimeout(1000);

    client.on('connect', () => {
      console.log(`${colors.green}✓${colors.reset} ${name} is running on ${host}:${port}`);
      client.destroy();
      resolve(true);
    });

    client.on('timeout', () => {
      console.log(`${colors.red}✗${colors.reset} ${name} is NOT running on ${host}:${port}`);
      client.destroy();
      resolve(false);
    });

    client.on('error', () => {
      console.log(`${colors.red}✗${colors.reset} ${name} is NOT running on ${host}:${port}`);
      resolve(false);
    });

    client.connect(port, host);
  });
}

async function checkAPI(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log(`${colors.green}✓${colors.reset} ${name} API responding (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} ${name} API status: ${res.statusCode}`);
        resolve(true);
      }
    });

    req.on('timeout', () => {
      console.log(`${colors.red}✗${colors.reset} ${name} API timeout`);
      req.destroy();
      resolve(false);
    });

    req.on('error', () => {
      console.log(`${colors.red}✗${colors.reset} ${name} API not responding`);
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('\n' + colors.blue + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  Tekurious ERP - Connectivity Check' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════' + colors.reset + '\n');

  console.log('Checking services...\n');

  const backendRunning = await checkPort('localhost', BACKEND_PORT, 'Backend Server');
  const frontendRunning = await checkPort('localhost', FRONTEND_PORT, 'Frontend Server');
  const dbRunning = await checkPort(DB_HOST, DB_PORT, 'PostgreSQL Database');

  console.log('\nChecking API endpoints...\n');

  let backendAPI = false;
  if (backendRunning) {
    backendAPI = await checkAPI(`http://localhost:${BACKEND_PORT}/health`, 'Backend Health');
  }

  console.log('\n' + colors.blue + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  Summary' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════' + colors.reset + '\n');

  if (!backendRunning) {
    console.log(colors.yellow + '⚠ Backend is not running!' + colors.reset);
    console.log('  Start with: npm run dev\n');
  }

  if (!frontendRunning) {
    console.log(colors.yellow + '⚠ Frontend is not running!' + colors.reset);
    console.log('  Start with: npm run web\n');
  }

  if (!dbRunning) {
    console.log(colors.yellow + '⚠ PostgreSQL is not running!' + colors.reset);
    console.log('  Make sure PostgreSQL is installed and running\n');
  }

  if (backendRunning && frontendRunning && dbRunning && backendAPI) {
    console.log(colors.green + '✓ All services are running correctly!' + colors.reset);
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000/test/api to test connectivity');
    console.log('2. Login at http://localhost:3000/auth/login');
    console.log('3. Use credentials: admin@example.com / password123\n');
  } else {
    console.log(colors.red + '✗ Some services are not running' + colors.reset);
    console.log('\nPlease start the missing services and try again.\n');
  }

  console.log(colors.blue + '═══════════════════════════════════════════' + colors.reset + '\n');
}

main().catch(console.error);
