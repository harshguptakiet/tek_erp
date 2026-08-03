/**
 * Module 07: Finance - Payment History
 * FR-FEE-015 to FR-FEE-020: Payment tracking and receipts
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

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with actual API call
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['payment-history', selectedAcademicYear, selectedStatus],
    queryFn: async () => ({
      academicYear: selectedAcademicYear,
      student: {
        name: 'Aarav Kumar',
        class: 'Class 10',
        section: 'A',
        admissionNumber: 'ADM2024001',
      },
      summary: {
        totalPaid: 72000,
        totalPending: 24000,
        totalRefunded: 0,
        transactionCount: 3,
      },
      payments: [
        {
          id: 'p1',
          receiptNumber: 'RCP20240401',
          date: '2024-04-15T10:30:00Z',
          term: 'Q1 (Apr-Jun 2024)',
          amount: 24000,
          method: 'ONLINE',
          status: 'PAID',
          transactionId: 'TXN20240415001',
          components: [
            { name: 'Tuition Fee', amount: 16000 },
            { name: 'Lab Fee', amount: 2500 },
            { name: 'Library Fee', amount: 1000 },
            { name: 'Exam Fee', amount: 2000 },
            { name: 'Sports Fee', amount: 1500 },
            { name: 'Activity Fee', amount: 1000 },
          ],
        },
        {
          id: 'p2',
          receiptNumber: 'RCP20240701',
          date: '2024-07-10T14:20:00Z',
          term: 'Q2 (Jul-Sep 2024)',
          amount: 24000,
          method: 'BANK_TRANSFER',
          status: 'PAID',
          transactionId: 'TXN20240710002',
          components: [
            { name: 'Tuition Fee', amount: 16000 },
            { name: 'Lab Fee', amount: 2500 },
            { name: 'Library Fee', amount: 1000 },
            { name: 'Exam Fee', amount: 2000 },
            { name: 'Sports Fee', amount: 1500 },
            { name: 'Activity Fee', amount: 1000 },
          ],
        },
        {
          id: 'p3',
          receiptNumber: 'RCP20241001',
          date: '2024-10-05T09:15:00Z',
          term: 'Q3 (Oct-Dec 2024)',
          amount: 24000,
          method: 'CASH',
          status: 'PAID',
          transactionId: 'TXN20241005003',
          components: [
            { name: 'Tuition Fee', amount: 16000 },
            { name: 'Lab Fee', amount: 2500 },
            { name: 'Library Fee', amount: 1000 },
            { name: 'Exam Fee', amount: 2000 },
            { name: 'Sports Fee', amount: 1500 },
            { name: 'Activity Fee', amount: 1000 },
          ],
        },
        {
          id: 'p4',
          receiptNumber: 'INV20250101',
          date: '2025-01-01T00:00:00Z',
          term: 'Q4 (Jan-Mar 2025)',
          amount: 24000,
          method: 'PENDING',
          status: 'PENDING',
          transactionId: null,
          components: [
            { name: 'Tuition Fee', amount: 16000 },
            { name: 'Lab Fee', amount: 2500 },
            { name: 'Library Fee', amount: 1000 },
            { name: 'Exam Fee', amount: 2000 },
            { name: 'Sports Fee', amount: 1500 },
            { name: 'Activity Fee', amount: 1000 },
          ],
        },
      ],
    }),
  });

  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

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

  const filteredPayments = historyData?.payments.filter((payment: any) => {
    if (selectedStatus === 'all') return true;
    return payment.status === selectedStatus;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/fees')}>
            ← Back to Fees
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="mt-2 text-sm text-gray-600">
              Complete payment history for {historyData?.student.name}
            </p>
          </div>
        </div>
      </div>

      {/* Student & Summary Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-semibold text-gray-900">{historyData?.student.name}</p>
              <p className="text-sm text-gray-600">
                {historyData?.student.class} - Section {historyData?.student.section} •{' '}
                {historyData?.student.admissionNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Academic Year</p>
              <p className="font-semibold text-gray-900">{historyData?.academicYear}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{historyData?.summary.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{historyData?.summary.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{historyData?.summary.totalRefunded.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyData?.summary.transactionCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <Select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="REFUNDED">Refunded</option>
              </Select>
            </div>
            <div className="pt-6">
              <Button variant="outline">Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg overflow-hidden">
                  {/* Payment Header */}
                  <div
                    className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setExpandedPayment(
                        expandedPayment === payment.id ? null : payment.id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {payment.receiptNumber}
                          </p>
                          <p className="text-sm text-gray-600">{payment.term}</p>
                        </div>
                        <Badge
                          variant={
                            payment.status === 'PAID'
                              ? 'success'
                              : payment.status === 'PENDING'
                              ? 'warning'
                              : payment.status === 'OVERDUE'
                              ? 'error'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {payment.status === 'PAID' && (
                            <>
                              <Button size="sm" variant="outline">
                                Download Receipt
                              </Button>
                              <Button size="sm" variant="ghost">
                                Email Receipt
                              </Button>
                            </>
                          )}
                          {payment.status === 'PENDING' && (
                            <Button size="sm">Pay Now</Button>
                          )}
                          <span className="text-gray-400">
                            {expandedPayment === payment.id ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details (Expandable) */}
                  {expandedPayment === payment.id && (
                    <div className="p-4 border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fee Component</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payment.components.map((comp: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell>{comp.name}</TableCell>
                              <TableCell className="text-right font-medium">
                                ₹{comp.amount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-semibold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">
                              ₹{payment.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>

                      {payment.status === 'PAID' && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Payment Method:</p>
                            <p className="font-semibold">
                              {payment.method.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Transaction ID:</p>
                            <p className="font-mono font-semibold">
                              {payment.transactionId}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment Date:</p>
                            <p className="font-semibold">
                              {new Date(payment.date).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Receipt Number:</p>
                            <p className="font-semibold">{payment.receiptNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
