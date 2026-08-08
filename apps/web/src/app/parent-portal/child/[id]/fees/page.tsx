/**
 * Child Fees View for Parents
 */

'use client';

import { useParams } from 'next/navigation';
import { useChildFees } from '@/features/parent/use-parent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ChildFeesPage() {
  const params = useParams();
  const childId = params.id as string;

  const { data: fees } = useChildFees(childId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <p className="text-muted-foreground">View and pay fees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Fees</div>
          <div className="text-3xl font-bold">₹{fees?.totalFees.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-3xl font-bold text-green-600">₹{fees?.paidAmount.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-3xl font-bold text-orange-600">₹{fees?.pendingAmount.toLocaleString()}</div>
        </Card>
      </div>

      {fees?.nextDueDate && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">Next Payment Due</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(fees.nextDueDate), 'MMM dd, yyyy')}
              </div>
            </div>
            <Button>Pay Now</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Payments</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {fees?.recentPayments?.map((payment: any) => (
              <div key={payment.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Receipt: {payment.receiptNumber}</div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
