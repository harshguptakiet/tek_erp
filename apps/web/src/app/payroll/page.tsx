/**
 * Payroll Management Page
 * FR-PAYROLL-001 to FR-PAYROLL-025: Salary processing and payroll management
 */

'use client';

import { PayrollManagement } from '@/features/payroll/payroll-management';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function PayrollPage() {
  return (
    <Can permission={PERMISSIONS.PAYROLL_VIEW}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Process salaries, manage payroll records, and generate payslips
          </p>
        </div>

        <PayrollManagement />
      </div>
    </Can>
  );
}
