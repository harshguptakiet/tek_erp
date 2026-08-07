/**
 * API Testing Page
 * Test backend connectivity and API endpoints
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { config } from '@/config/env';
import { apiClient } from '@/lib/axios';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

export default function APITestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('admin@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  const updateResult = (name: string, status: TestResult['status'], message: string, responseTime?: number) => {
    setResults(prev => [
      ...prev.filter(r => r.name !== name),
      { name, status, message, responseTime }
    ]);
  };

  const testBackendConnection = async () => {
    const start = Date.now();
    updateResult('Backend Connection', 'pending', 'Testing...');
    
    try {
      // Try multiple health check endpoints
      const healthUrls = [
        config.apiUrl.replace('/api/v1', '/health'),
        config.apiUrl.replace('/api/v1', '/api/v1/health'),
        `${config.apiUrl.split('/api/v1')[0]}/health`
      ];

      let response;
      let successUrl = '';
      
      for (const url of healthUrls) {
        try {
          response = await fetch(url, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            successUrl = url;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      const responseTime = Date.now() - start;
      
      if (response && response.ok) {
        updateResult('Backend Connection', 'success', `Connected successfully (${responseTime}ms) - ${successUrl}`, responseTime);
        return true;
      } else {
        updateResult('Backend Connection', 'error', `All health check endpoints failed. Is backend running on port 3333?`);
        return false;
      }
    } catch (error: any) {
      updateResult('Backend Connection', 'error', `Connection failed: ${error.message}. Backend may not be running.`);
      return false;
    }
  };

  const testDatabaseConnection = async () => {
    const start = Date.now();
    updateResult('Database Connection', 'pending', 'Testing...');
    
    try {
      const response = await apiClient.get('/health/db');
      const responseTime = Date.now() - start;
      updateResult('Database Connection', 'success', `Database connected (${responseTime}ms)`, responseTime);
      return true;
    } catch (error: any) {
      updateResult('Database Connection', 'error', error.message || 'Database connection failed');
      return false;
    }
  };

  const testAuthEndpoint = async () => {
    const start = Date.now();
    updateResult('Auth Endpoint', 'pending', 'Testing login endpoint...');
    
    try {
      const response = await apiClient.post('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      const responseTime = Date.now() - start;
      
      if (response.data.accessToken) {
        updateResult('Auth Endpoint', 'success', `Login successful (${responseTime}ms)`, responseTime);
        return true;
      } else {
        updateResult('Auth Endpoint', 'error', 'No access token received');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      updateResult('Auth Endpoint', 'error', message);
      return false;
    }
  };

  const testStudentsEndpoint = async () => {
    const start = Date.now();
    updateResult('Students Endpoint', 'pending', 'Testing students list...');
    
    try {
      // First login to get token
      const authResponse = await apiClient.post('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      if (!authResponse.data.accessToken) {
        updateResult('Students Endpoint', 'error', 'No access token available');
        return false;
      }

      // Test students endpoint with token
      const response = await apiClient.get('/students', {
        headers: {
          Authorization: `Bearer ${authResponse.data.accessToken}`
        }
      });
      
      const responseTime = Date.now() - start;
      updateResult('Students Endpoint', 'success', `Retrieved students data (${responseTime}ms)`, responseTime);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students';
      updateResult('Students Endpoint', 'error', message);
      return false;
    }
  };

  const testClassesEndpoint = async () => {
    const start = Date.now();
    updateResult('Classes Endpoint', 'pending', 'Testing classes list...');
    
    try {
      const authResponse = await apiClient.post('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      if (!authResponse.data.accessToken) {
        updateResult('Classes Endpoint', 'error', 'No access token available');
        return false;
      }

      const response = await apiClient.get('/classes', {
        headers: {
          Authorization: `Bearer ${authResponse.data.accessToken}`
        }
      });
      
      const responseTime = Date.now() - start;
      updateResult('Classes Endpoint', 'success', `Retrieved classes data (${responseTime}ms)`, responseTime);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch classes';
      updateResult('Classes Endpoint', 'error', message);
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Run tests sequentially
    const backendConnected = await testBackendConnection();
    
    if (backendConnected) {
      await testDatabaseConnection();
      await testAuthEndpoint();
      await testStudentsEndpoint();
      await testClassesEndpoint();
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="error">Failed</Badge>;
      case 'pending':
        return <Badge variant="default">Testing...</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Testing Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Test backend connectivity and API endpoints
        </p>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Backend API configuration and test credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <Input value={config.apiUrl} disabled className="font-mono text-sm" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email
              </label>
              <Input 
                type="email" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Password
              </label>
              <Input 
                type="password" 
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'success').length} of {results.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div 
                  key={result.name}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' :
                    result.status === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{result.name}</h3>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.responseTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        Response time: {result.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting */}
      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <AlertCircle className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 space-y-2">
          <p><strong>Backend Connection Failed:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Ensure the backend server is running on port 3333</li>
            <li>Check if DATABASE_URL is correctly configured in .env</li>
            <li>Verify the backend .env file has PORT=3333</li>
            <li>Run: <code className="bg-yellow-100 px-1 rounded">cd tekurious && npm run start:dev</code></li>
          </ul>
          
          <p className="mt-4"><strong>Auth Endpoint Failed:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Check if the test email and password are correct</li>
            <li>Verify user exists in database or create a test user</li>
            <li>Check JWT_SECRET is configured in backend .env</li>
          </ul>

          <p className="mt-4"><strong>Database Connection Failed:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Ensure PostgreSQL is running</li>
            <li>Verify DATABASE_URL in .env file</li>
            <li>Run migrations: <code className="bg-yellow-100 px-1 rounded">npm run migration:run</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
