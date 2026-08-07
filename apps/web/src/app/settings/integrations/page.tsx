/**
 * Module 17: System Settings - Third-Party Integrations
 * FR-SYSTEM-003: Connect external services and apps
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link2, ExternalLink, Settings, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'education' | 'communication' | 'storage' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSync?: string;
  features: string[];
  requiresConfig?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect Google Drive, Calendar, and Gmail for seamless integration',
    icon: '🔵',
    category: 'productivity',
    status: 'disconnected',
    features: ['Calendar Sync', 'Drive Storage', 'Gmail Notifications', 'Single Sign-On'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    description: 'Integrate with OneDrive, Teams, and Outlook',
    icon: '📘',
    category: 'productivity',
    status: 'disconnected',
    features: ['Teams Integration', 'OneDrive Storage', 'Outlook Calendar', 'SSO'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and join Zoom meetings directly from the platform',
    icon: '📹',
    category: 'communication',
    status: 'connected',
    connectedAt: '2024-01-15',
    lastSync: '2024-02-04',
    features: ['Meeting Scheduling', 'Auto-join Links', 'Recording Access'],
    requiresConfig: true,
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Create and manage Google Meet sessions',
    icon: '🎥',
    category: 'communication',
    status: 'disconnected',
    features: ['Instant Meetings', 'Calendar Integration', 'Recording'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive notifications and updates in your Slack workspace',
    icon: '💬',
    category: 'communication',
    status: 'disconnected',
    features: ['Notifications', 'Assignment Updates', 'Announcements'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Store and share files using Dropbox',
    icon: '📦',
    category: 'storage',
    status: 'disconnected',
    features: ['File Storage', 'Assignment Submissions', 'Content Library'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track usage and engagement metrics',
    icon: '📊',
    category: 'analytics',
    status: 'connected',
    connectedAt: '2023-12-01',
    lastSync: '2024-02-04',
    features: ['User Analytics', 'Event Tracking', 'Custom Reports'],
    requiresConfig: true,
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    description: 'Accept online payments for fees and purchases',
    icon: '💳',
    category: 'productivity',
    status: 'error',
    connectedAt: '2024-01-20',
    features: ['Fee Collection', 'Secure Payments', 'Refund Processing'],
    requiresConfig: true,
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const connectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: (_, integrationId) => {
      toast.success('Integration connected successfully');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: () => {
      toast.error('Failed to connect integration');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Integration disconnected');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: () => {
      toast.error('Failed to disconnect integration');
    },
  });

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Integrations', count: integrations.length },
    { value: 'productivity', label: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
    { value: 'education', label: 'Education', count: integrations.filter(i => i.category === 'education').length },
    { value: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { value: 'storage', label: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
    { value: 'analytics', label: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          ← Back to settings
        </Button>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Connect third-party apps and services to enhance your workflow
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'disconnected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                {integration.status === 'connected' && (
                  <Badge variant="success">Connected</Badge>
                )}
                {integration.status === 'error' && (
                  <Badge variant="error">Error</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                <div className="flex flex-wrap gap-2">
                  {integration.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Connection Info */}
              {integration.status === 'connected' && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Connected: {new Date(integration.connectedAt!).toLocaleDateString()}</p>
                  <p>Last synced: {new Date(integration.lastSync!).toLocaleDateString()}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {integration.status === 'disconnected' && (
                  <Button
                    onClick={() => connectMutation.mutate(integration.id)}
                    disabled={connectMutation.isPending}
                    className="flex-1"
                  >
                    {connectMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}

                {integration.status === 'connected' && (
                  <>
                    {integration.requiresConfig && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/settings/integrations/${integration.id}`)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => disconnectMutation.mutate(integration.id)}
                      disabled={disconnectMutation.isPending}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  </>
                )}

                {integration.status === 'error' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => connectMutation.mutate(integration.id)}
                      disabled={connectMutation.isPending}
                      className="flex-1"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/settings/integrations/${integration.id}`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://docs.example.com/integrations/${integration.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Link2 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No integrations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Need help with integrations?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            Check our documentation for detailed setup guides and troubleshooting tips.
          </p>
          <Button variant="outline" onClick={() => window.open('https://docs.example.com/integrations', '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
