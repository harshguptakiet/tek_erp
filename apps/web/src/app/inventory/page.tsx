/**
 * Inventory & Assets Management Page
 * FR-INVENTORY-001 to FR-INVENTORY-020: Comprehensive inventory tracking
 */

'use client';

import { InventoryManagement } from '@/features/inventory/inventory-management';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function InventoryPage() {
  return (
    <Can permission={PERMISSIONS.INVENTORY_VIEW}>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="page-title">Inventory & Assets</h1>
          <p className="page-description">
            Manage school inventory, track stock levels, lab equipment, and monitor physical assets
          </p>
        </div>

        <div className="card-premium p-6">
          <InventoryManagement />
        </div>
      </div>
    </Can>
  );
}
