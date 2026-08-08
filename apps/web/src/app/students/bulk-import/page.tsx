/**
 * Bulk Student Import Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { BulkImportWizard } from '@/features/students/bulk-import-wizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BulkImportPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bulk Import Students</h1>
        <p className="text-muted-foreground mt-2">
          Import multiple students at once using a CSV file
        </p>
      </div>

      <BulkImportWizard />
    </div>
  );
}
