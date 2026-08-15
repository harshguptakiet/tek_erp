/**
 * Module 07: Finance - Fee Management
 * FR-FEE-001 to FR-FEE-010: Fee structure and payment tracking
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { feeService } from '@/services/fee.service';
import { useAuthStore } from '@/stores/auth.store';

const MOCK_FEE_STRUCTURES = [
  {
    id: 'fs-1',
    class: 'Class 10',
    term: 'Q1 Term (Apr - Jun)',
    dueDate: '2026-06-30',
    total: 24000,
    totalMandatory: 22000,
    totalOptional: 2000,
    components: [
      { name: 'Tuition Fee', amount: 15000, mandatory: true },
      { name: 'Laboratory & Computer Fee', amount: 4000, mandatory: true },
      { name: 'Library & E-Resources', amount: 3000, mandatory: true },
      { name: 'Transport / Bus Fee', amount: 2000, mandatory: false },
    ],
  },
  {
    id: 'fs-2',
    class: 'Class 11 Science',
    term: 'Q1 Term (Apr - Jun)',
    dueDate: '2026-06-30',
    total: 28000,
    totalMandatory: 25000,
    totalOptional: 3000,
    components: [
      { name: 'Tuition Fee', amount: 18000, mandatory: true },
      { name: 'Physics & Chem Science Lab', amount: 5000, mandatory: true },
      { name: 'Library & Study Material', amount: 2000, mandatory: true },
      { name: 'Robotics Workshop Fee', amount: 3000, mandatory: false },
    ],
  },
];

export default function FeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [selectedClass, setSelectedClass] = useState('all');

  // Real API integration
  const { data: feeResponse, isLoading } = useQuery({
    queryKey: ['fees', user?.schoolId, selectedAcademicYear, selectedClass],
    queryFn: () => feeService.listFeeStructures({
      schoolId: user?.schoolId,
      classId: selectedClass !== 'all' ? selectedClass : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API data with mock fallback
  const apiFeeStructures = Array.isArray(feeResponse) ? feeResponse : feeResponse?.feeStructures || [];
  const feeStructures = apiFeeStructures.length > 0 ? apiFeeStructures : MOCK_FEE_STRUCTURES;

  const feeData = {
    academicYear: selectedAcademicYear,
    feeStructures,
    myFeeStatus: feeResponse?.myFeeStatus || {
      studentName: `${user?.firstName || 'Jane'} ${user?.lastName || 'Student'}`,
      class: 'Class 10',
      section: 'A',
      admissionNumber: 'ADM2024001',
      totalFee: 96000,
      paid: 48000,
      pending: 48000,
      overdue: 0,
      nextDueDate: '2026-12-31',
      nextDueAmount: 24000,
      paymentHistory: [
        {
          id: 'p1',
          receiptNumber: 'RCP20240401',
          date: '2026-04-15',
          amount: 24000,
          term: 'Q1 (Apr-Jun 2026)',
          method: 'ONLINE',
          status: 'PAID',
        },
        {
          id: 'p2',
          receiptNumber: 'RCP20240701',
          date: '2026-07-10',
          amount: 24000,
          term: 'Q2 (Jul-Sep 2026)',
          method: 'BANK_TRANSFER',
          status: 'PAID',
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const myStatus = feeData?.myFeeStatus;
  const paymentProgress = myStatus ? (myStatus.paid / myStatus.totalFee) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Fee Management</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              View fee structure and manage payments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/fees/history')}>
              Payment History
            </Button>
            {myStatus && myStatus.pending > 0 && (
              <Button onClick={() => router.push('/fees/payment')}>
                Pay Now (₹{myStatus.pending.toLocaleString()})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* My Fee Status (Student View) */}
      {myStatus && (
        <>
          <Card className="card-premium mb-6">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--foreground))]">My Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Student</p>
                    <p className="font-semibold text-[hsl(var(--foreground))] text-lg">{myStatus.studentName}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {myStatus.class} - Section {myStatus.section} • {myStatus.admissionNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Academic Year</p>
                    <p className="font-semibold text-[hsl(var(--foreground))]">{feeData.academicYear}</p>
                  </div>
                </div>

                {/* Payment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[hsl(var(--muted)/0.4)] rounded-xl border border-[hsl(var(--border)/0.6)]">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Total Fee</p>
                    <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                      ₹{myStatus.totalFee.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Paid</p>
                    <p className="text-2xl font-bold text-emerald-500 mt-1">
                      ₹{myStatus.paid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Pending</p>
                    <p className="text-2xl font-bold text-amber-500 mt-1">
                      ₹{myStatus.pending.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Overdue</p>
                    <p className="text-2xl font-bold text-rose-500 mt-1">
                      ₹{myStatus.overdue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Payment Progress</p>
                    <p className="text-sm font-bold text-[hsl(var(--foreground))]">{Math.round(paymentProgress)}%</p>
                  </div>
                  <div className="w-full h-3 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Next Due */}
                {myStatus.pending > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-500">Next Payment Due</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                          ₹{myStatus.nextDueAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                          Due by: {new Date(myStatus.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => router.push('/fees/payment')}>
                        Pay Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="card-premium mb-6 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[hsl(var(--foreground))]">Recent Payments</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/fees/history')}
                >
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myStatus.paymentHistory.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-[hsl(var(--muted)/0.5)]">
                      <TableCell className="font-semibold text-[hsl(var(--foreground))]">{payment.receiptNumber}</TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))]">{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-[hsl(var(--foreground))]">{payment.term}</TableCell>
                      <TableCell className="font-bold text-[hsl(var(--foreground))]">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.method.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">PAID</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          Download Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Fee Structure */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[hsl(var(--foreground))]">Fee Structure</CardTitle>
            <div className="flex items-center gap-4">
              <Select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-40"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </Select>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-32"
              >
                <option value="all">All Classes</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeData?.feeStructures
              .filter((fs: any) => selectedClass === 'all' || fs.class.includes(selectedClass))
              .map((structure: any) => (
                <div key={structure.id} className="border border-[hsl(var(--border))] rounded-xl p-4 bg-[hsl(var(--card))]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">{structure.class}</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {structure.term} • Due: {new Date(structure.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                        ₹{structure.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">per term</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structure.components.map((component: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-[hsl(var(--muted)/0.5)]">
                          <TableCell className="text-[hsl(var(--foreground))]">{component.name}</TableCell>
                          <TableCell>
                            <Badge variant={component.mandatory ? 'error' : 'secondary'}>
                              {component.mandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-[hsl(var(--foreground))]">
                            ₹{component.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-[hsl(var(--muted)/0.4)] font-bold text-[hsl(var(--foreground))]">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">
                          ₹{structure.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Mandatory Fees:</p>
                      <p className="font-bold text-[hsl(var(--foreground))]">₹{structure.totalMandatory.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Optional Fees:</p>
                      <p className="font-bold text-[hsl(var(--foreground))]">₹{structure.totalOptional.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-premium">
          <CardContent className="pt-6">
            <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">💳 Payment Methods</h3>
            <ul className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
              <li>• Online Payment (Credit/Debit Card)</li>
              <li>• Net Banking</li>
              <li>• UPI</li>
              <li>• Bank Transfer</li>
              <li>• Cash (at office)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="pt-6">
            <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">⏰ Payment Schedule</h3>
            <ul className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
              <li>• Q1: Due by June 30</li>
              <li>• Q2: Due by September 30</li>
              <li>• Q3: Due by December 31</li>
              <li>• Q4: Due by March 31</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="pt-6">
            <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">ℹ️ Important Notes</h3>
            <ul className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
              <li>• Late payment: ₹500 fine per month</li>
              <li>• Early payment: 5% discount</li>
              <li>• Sibling discount: 10% on 2nd child</li>
              <li>• Contact office for payment plans</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
