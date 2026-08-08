/**
 * Room Allocation Page
 * Allocate students to hostel rooms
 */

'use client';

import { useState } from 'react';
import { RoomAllocationWizard } from '@/features/hostel/room-allocation-wizard';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AllocateRoomPage() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(true);

  const handleClose = () => {
    setShowWizard(false);
    router.push('/hostel');
  };

  return (
    <Can permission={PERMISSIONS.HOSTEL_MANAGE}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/hostel')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hostel
          </Button>
        </div>

        <RoomAllocationWizard
          open={showWizard}
          onClose={handleClose}
        />
      </div>
    </Can>
  );
}
