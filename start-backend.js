#!/usr/bin/env node
/**
 * Direct backend starter - Bypasses Nx
 * Run with: node start-backend.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Tekurious Backend (Port 3333)...\n');

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Start the NestJS application using ts-node
const backendPath = path.join(__dirname, 'apps', 'tekurious_erp', 'src', 'main.ts');

const tsNode = spawn('npx', [
  'ts-node',
  '--project', 'apps/tekurious_erp/tsconfig.app.json',
  '-r', 'tsconfig-paths/register',
  '--transpile-only',
  backendPath
], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    TS_NODE_PROJECT: 'apps/tekurious_erp/tsconfig.app.json'
  }
});

tsNode.on('error', (err) => {
  console.error('❌ Failed to start backend:', err.message);
  process.exit(1);
});

tsNode.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down backend...');
  tsNode.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  tsNode.kill('SIGTERM');
  process.exit(0);
});
