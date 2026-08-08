/**
 * Live Bus Tracking Page
 * Real-time GPS tracking of school buses
 */

'use client';

import { LiveTrackingMap } from '@/features/transport/live-tracking-map';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BusTrackingPage() {
  const router = useRouter();

  return (
    <Can permission={PERMISSIONS.TRANSPORT_VIEW}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/transport')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transport
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Bus Tracking</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track school buses in real-time with GPS location and route information
          </p>
        </div>

        <LiveTrackingMap />
      </div>
    </Can>
  );
}
