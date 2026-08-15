'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laptop, Smartphone, Trash2, ArrowLeft, ShieldCheck, Plus, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

function safeList(list?: (string | null | undefined)[]): string[] {
  return (list || []).filter((d): d is string => typeof d === 'string' && d.length > 0);
}

export default function TrustedDevicesPage() {
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await authService.getTrustedDevices();
      // Filter out any null/undefined/non-string entries defensively -
      // a malformed DB row (trustedDevices null before a migration default
      // kicked in) previously caused a client-side crash here.
      setDevices(safeList(res.devices));
    } catch (err: any) {
      toast.error('Failed to load trusted devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleTrustCurrentDevice = async () => {
    try {
      setActionLoading(true);
      const res = await authService.trustDevice();
      setDevices(safeList(res.devices));
      toast.success('Current device marked as trusted!');
    } catch (err: any) {
      toast.error('Failed to trust device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setActionLoading(true);
      const res = await authService.removeTrustedDevice(deviceId);
      setDevices(safeList(res.devices));
      toast.success('Trusted device removed');
    } catch (err: any) {
      toast.error('Failed to remove device');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings/security"
          className="p-2 rounded-xl hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">Trusted Devices</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Manage devices that skip additional security verification prompts
          </p>
        </div>
      </div>

      {/* Primary Banner */}
      <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Trust This Device</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Add your current browser and OS as a trusted device
            </p>
          </div>
        </div>

        <button
          onClick={handleTrustCurrentDevice}
          disabled={actionLoading}
          className="
            h-10 px-5 rounded-xl text-sm font-semibold text-white
            flex items-center gap-2
            disabled:opacity-60 transition-all duration-200
            hover:shadow-md hover:shadow-[hsl(var(--primary)/0.25)]
          "
          style={{ background: 'var(--gradient-primary)' }}
        >
          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Trust Current Device
        </button>
      </div>

      {/* Device List */}
      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm overflow-hidden">
        <div className="p-4 px-6 border-b border-[hsl(var(--border))] font-semibold text-sm">
          Active Trusted Devices ({devices.length})
        </div>

        {loading ? (
          <div className="p-8 flex justify-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No trusted devices registered yet. Click &quot;Trust Current Device&quot; to add one.
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {devices.map((device, idx) => (
              <div key={idx} className="p-4 px-6 flex items-center justify-between hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted)/0.5)] flex items-center justify-center text-[hsl(var(--foreground))]">
                    {(device || '').toLowerCase().includes('phone') || (device || '').toLowerCase().includes('safari') ? (
                      <Smartphone className="h-5 w-5" />
                    ) : (
                      <Laptop className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{device}</div>
                    <div className="text-xs text-emerald-500 font-medium">Verified Device</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDevice(device)}
                  disabled={actionLoading}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove trust"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
