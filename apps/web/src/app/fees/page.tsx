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

export default function FeesPage() {
  const router = useRouter();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data - replace with actual API call
  const { data: feeData, isLoading } = useQuery({
    queryKey: ['fees', selectedAcademicYear, selectedClass],
    queryFn: async () => ({
      academicYear: selectedAcademicYear,
      feeStructures: [
        {
          id: '1',
          class: 'Class 9',
          term: 'QUARTERLY',
          components: [
            { name: 'Tuition Fee', amount: 15000, mandatory: true },
            { name: 'Lab Fee', amount: 2000, mandatory: true },
            { name: 'Library Fee', amount: 1000, mandatory: true },
            { name: 'Sports Fee', amount: 1500, mandatory: false },
            { name: 'Activity Fee', amount: 1000, mandatory: false },
          ],
          totalMandatory: 18000,
          totalOptional: 2500,
          total: 20500,
          dueDate: '2024-09-30',
        },
        {
          id: '2',
          class: 'Class 10',
          term: 'QUARTERLY',
          components: [
            { name: 'Tuition Fee', amount: 16000, mandatory: true },
            { name: 'Lab Fee', amount: 2500, mandatory: true },
            { name: 'Library Fee', amount: 1000, mandatory: true },
            { name: 'Exam Fee', amount: 2000, mandatory: true },
            { name: 'Sports Fee', amount: 1500, mandatory: false },
            { name: 'Activity Fee', amount: 1000, mandatory: false },
          ],
          totalMandatory: 21500,
          totalOptional: 2500,
          total: 24000,
          dueDate: '2024-09-30',
        },
        {
          id: '3',
          class: 'Class 11',
          term: 'QUARTERLY',
          components: [
            { name: 'Tuition Fee', amount: 18000, mandatory: true },
            { name: 'Lab Fee', amount: 3000, mandatory: true },
            { name: 'Library Fee', amount: 1200, mandatory: true },
            { name: 'Computer Lab Fee', amount: 2000, mandatory: true },
            { name: 'Sports Fee', amount: 1500, mandatory: false },
            { name: 'Activity Fee', amount: 1000, mandatory: false },
          ],
          totalMandatory: 24200,
          totalOptional: 2500,
          total: 26700,
          dueDate: '2024-09-30',
        },
      ],
      myFeeStatus: {
        studentName: 'Aarav Kumar',
        class: 'Class 10',
        section: 'A',
        admissionNumber: 'ADM2024001',
        totalFee: 96000, // Annual
        paid: 48000,
        pending: 48000,
        overdue: 0,
        nextDueDate: '2024-12-31',
        nextDueAmount: 24000,
        paymentHistory: [
          {
            id: 'p1',
            receiptNumber: 'RCP20240401',
            date: '2024-04-15',
            amount: 24000,
            term: 'Q1 (Apr-Jun 2024)',
            method: 'ONLINE',
            status: 'PAID',
          },
          {
            id: 'p2',
            receiptNumber: 'RCP20240701',
            date: '2024-07-10',
            amount: 24000,
            term: 'Q2 (Jul-Sep 2024)',
            method: 'BANK_TRANSFER',
            status: 'PAID',
          },
        ],
      },
    }),
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="mt-2 text-sm text-gray-600">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-semibold text-gray-900">{myStatus.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {myStatus.class} - Section {myStatus.section} • {myStatus.admissionNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Academic Year</p>
                    <p className="font-semibold text-gray-900">{feeData.academicYear}</p>
                  </div>
                </div>

                {/* Payment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Fee</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{myStatus.totalFee.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{myStatus.paid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{myStatus.pending.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{myStatus.overdue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Payment Progress</p>
                    <p className="text-sm font-medium text-gray-900">{Math.round(paymentProgress)}%</p>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Next Due */}
                {myStatus.pending > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Next Payment Due</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          ₹{myStatus.nextDueAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Payments</CardTitle>
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
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.receiptNumber}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.term}</TableCell>
                      <TableCell className="font-semibold">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fee Structure</CardTitle>
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
                <div key={structure.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{structure.class}</h3>
                      <p className="text-sm text-gray-600">
                        {structure.term} • Due: {new Date(structure.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{structure.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">per term</p>
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
                        <TableRow key={idx}>
                          <TableCell>{component.name}</TableCell>
                          <TableCell>
                            <Badge variant={component.mandatory ? 'error' : 'secondary'}>
                              {component.mandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{component.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">
                          ₹{structure.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Mandatory Fees:</p>
                      <p className="font-semibold">₹{structure.totalMandatory.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Optional Fees:</p>
                      <p className="font-semibold">₹{structure.totalOptional.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">💳 Payment Methods</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Online Payment (Credit/Debit Card)</li>
              <li>• Net Banking</li>
              <li>• UPI</li>
              <li>• Bank Transfer</li>
              <li>• Cash (at office)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">⏰ Payment Schedule</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Q1: Due by June 30</li>
              <li>• Q2: Due by September 30</li>
              <li>• Q3: Due by December 31</li>
              <li>• Q4: Due by March 31</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Important Notes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
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
