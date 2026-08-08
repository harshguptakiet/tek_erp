/**
 * Certificates Page
 * Generate and manage student certificates
 */

'use client';

import { CertificateGenerator } from '@/features/certificates/certificate-generator';

export default function CertificatesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certificate Generation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate achievement, participation, and merit certificates for students
        </p>
      </div>

      <CertificateGenerator />
    </div>
  );
}
