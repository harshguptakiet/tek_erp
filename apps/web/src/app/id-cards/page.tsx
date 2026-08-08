/**
 * ID Cards Page
 * Generate and print ID cards for students, teachers, and staff
 */

'use client';

import { IDCardGenerator } from '@/features/id-cards/id-card-generator';

export default function IDCardsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">ID Card Generation</h1>
        <p className="page-description">
          Generate, preview, and print digital and physical ID cards for students, teachers, and staff
        </p>
      </div>

      <div className="card-premium p-6">
        <IDCardGenerator />
      </div>
    </div>
  );
}
