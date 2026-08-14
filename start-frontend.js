#!/usr/bin/env node
/**
 * Direct frontend starter - Bypasses Nx
 * Run with: node start-frontend.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Tekurious Frontend (Port 3000)...\n');

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Start Next.js application
const frontendPath = path.join(__dirname, 'apps', 'web');

const nextDev = spawn('npx', [
  'next', 
  'dev',
  '--turbo'  // Enable Turbopack for 10x faster compilation
], {
  stdio: 'inherit',
  shell: true,
  cwd: frontendPath,
  env: {
    ...process.env,
    PORT: '3000',
  }
});

nextDev.on('error', (err) => {
  console.error('❌ Failed to start frontend:', err.message);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Frontend exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down frontend...');
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
});
