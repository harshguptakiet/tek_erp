/**
 * Payroll Management Component
 * Comprehensive salary and payroll processing system
 * Features: Salary calculation, deductions, bonuses, payslip generation, payment processing
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Eye,
  Plus,
  Minus,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { cn } from '@/lib/utils';

const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020, 'Invalid year'),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  allowances: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })).optional(),
  deductions: z.array(z.object({
    type: z.string(),
    amount: z.number(),
  })).optional(),
  workingDays: z.number().min(1, 'Working days must be at least 1'),
  presentDays: z.number().min(0, 'Present days cannot be negative'),
  overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: { type: string; amount: number }[];
  deductions: { type: string; amount: number }[];
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  overtimeHours: number;
  overtimePay: number;
  status: 'DRAFT' | 'PROCESSED' | 'PAID';
  processedDate?: string;
  paidDate?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const allowanceTypes = [
  'HRA (House Rent Allowance)',
  'DA (Dearness Allowance)',
  'Medical Allowance',
  'Transport Allowance',
  'Special Allowance',
  'Performance Bonus',
];

const deductionTypes = [
  'PF (Provident Fund)',
  'ESI (Employee State Insurance)',
  'Professional Tax',
  'Income Tax (TDS)',
  'Loan EMI',
  'Other Deductions',
];

export function PayrollManagement() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  // Mock data - replace with actual API calls
  const [records, setRecords] = useState<PayrollRecord[]>([
    {
      id: '1',
      employeeId: 'E001',
      employeeName: 'Rajesh Kumar',
      employeeCode: 'TCH-001',
      designation: 'Senior Teacher',
      month: 'December',
      year: 2026,
      basicSalary: 50000,
      allowances: [
        { type: 'HRA', amount: 15000 },
        { type: 'DA', amount: 5000 },
        { type: 'Transport', amount: 2000 },
      ],
      deductions: [
        { type: 'PF', amount: 6000 },
        { type: 'ESI', amount: 1500 },
        { type: 'Tax', amount: 3000 },
      ],
      grossSalary: 72000,
      netSalary: 61500,
      workingDays: 26,
      presentDays: 26,
      overtimeHours: 0,
      overtimePay: 0,
      status: 'PAID',
      processedDate: '2026-12-28T10:00:00Z',
      paidDate: '2026-12-30T14:00:00Z',
    },
    {
      id: '2',
      employeeId: 'E002',
      employeeName: 'Priya Sharma',
      employeeCode: 'TCH-002',
      designation: 'Junior Teacher',
      month: 'December',
      year: 2026,
      basicSalary: 35000,
      allowances: [
        { type: 'HRA', amount: 10500 },
        { type: 'DA', amount: 3500 },
      ],
      deductions: [
        { type: 'PF', amount: 4200 },
        { type: 'ESI', amount: 1000 },
      ],
      grossSalary: 49000,
      netSalary: 43800,
      workingDays: 26,
      presentDays: 24,
      overtimeHours: 5,
      overtimePay: 1200,
      status: 'PROCESSED',
      processedDate: '2026-12-28T10:00:00Z',
    },
  ]);

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      month: months[new Date().getMonth()],
      year: new Date().getFullYear(),
      workingDays: 26,
      presentDays: 26,
      overtimeHours: 0,
      allowances: [],
      deductions: [],
    },
  });

  const stats = {
    totalEmployees: records.length,
    totalPayroll: records.reduce((sum, r) => sum + r.netSalary, 0),
    processed: records.filter((r) => r.status === 'PROCESSED' || r.status === 'PAID').length,
    paid: records.filter((r) => r.status === 'PAID').length,
    pending: records.filter((r) => r.status === 'DRAFT').length,
  };

  const filteredRecords = records.filter((record) => {
    const matchesMonth = selectedMonth === 'all' || months.indexOf(record.month) === parseInt(selectedMonth);
    const matchesYear = record.year === selectedYear;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesMonth && matchesYear && matchesStatus;
  });

  const handleProcessPayroll = (recordId: string) => {
    setRecords(records.map(r =>
      r.id === recordId
        ? { ...r, status: 'PROCESSED', processedDate: new Date().toISOString() }
        : r
    ));
  };

  const handleMarkPaid = (recordId: string) => {
    setRecords(records.map(r =>
      r.id === recordId
        ? { ...r, status: 'PAID', paidDate: new Date().toISOString() }
        : r
    ));
  };

  const handleGeneratePayslip = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setShowPayslipDialog(true);
  };

  const handleBulkProcess = () => {
    const draftRecords = records.filter(r => r.status === 'DRAFT');
    setRecords(records.map(r =>
      r.status === 'DRAFT'
        ? { ...r, status: 'PROCESSED', processedDate: new Date().toISOString() }
        : r
    ));
  };

  const columns = [
    {
      header: 'Employee',
      accessorKey: 'employeeName',
      cell: ({ row }: any) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.employeeName}</p>
          <p className="text-xs text-gray-600">
            {row.original.employeeCode} • {row.original.designation}
          </p>
        </div>
      ),
    },
    {
      header: 'Period',
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.month} {row.original.year}</span>
      ),
    },
    {
      header: 'Basic Salary',
      accessorKey: 'basicSalary',
      cell: ({ row }: any) => `₹${row.original.basicSalary.toLocaleString()}`,
    },
    {
      header: 'Gross Salary',
      accessorKey: 'grossSalary',
      cell: ({ row }: any) => `₹${row.original.grossSalary.toLocaleString()}`,
    },
    {
      header: 'Net Salary',
      accessorKey: 'netSalary',
      cell: ({ row }: any) => (
        <span className="font-semibold text-green-600">
          ₹{row.original.netSalary.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Attendance',
      cell: ({ row }: any) => (
        <span className="text-sm">
          {row.original.presentDays}/{row.original.workingDays} days
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'PAID' ? 'default' :
              status === 'PROCESSED' ? 'secondary' : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGeneratePayslip(row.original)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {row.original.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleProcessPayroll(row.original.id)}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Process
            </Button>
          )}
          {row.original.status === 'PROCESSED' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleMarkPaid(row.original.id)}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Mark Paid
            </Button>
          )}
          {row.original.status === 'PAID' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGeneratePayslip(row.original)}
            >
              <Download className="h-3 w-3 mr-1" />
              Payslip
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{(stats.totalPayroll / 100000).toFixed(1)}L
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.processed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.pending > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {stats.pending} payroll record{stats.pending > 1 ? 's are' : ' is'} pending processing.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <SelectRoot value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>

              <SelectRoot value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </SelectRoot>

              <SelectRoot value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PROCESSED">Processed</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowProcessDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Payroll
              </Button>
              <Button onClick={handleBulkProcess} disabled={stats.pending === 0}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Bulk Process
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredRecords} />
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      {selectedRecord && (
        <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payslip - {selectedRecord.month} {selectedRecord.year}</DialogTitle>
              <DialogDescription>{selectedRecord.employeeName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 p-6 bg-white rounded-lg border">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">SALARY SLIP</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRecord.month} {selectedRecord.year}
                </p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee Name:</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee Code:</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation:</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendance:</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRecord.presentDays}/{selectedRecord.workingDays} days
                  </p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">EARNINGS</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Salary:</span>
                      <span className="font-medium">₹{selectedRecord.basicSalary.toLocaleString()}</span>
                    </div>
                    {selectedRecord.allowances.map((allowance, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{allowance.type}:</span>
                        <span className="font-medium">₹{allowance.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedRecord.overtimePay > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Overtime ({selectedRecord.overtimeHours}h):
                        </span>
                        <span className="font-medium">₹{selectedRecord.overtimePay.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Gross Salary:</span>
                      <span>₹{selectedRecord.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">DEDUCTIONS</h3>
                  <div className="space-y-2">
                    {selectedRecord.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{deduction.type}:</span>
                        <span className="font-medium text-red-600">
                          -₹{deduction.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Total Deductions:</span>
                      <span className="text-red-600">
                        -₹{selectedRecord.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Net Salary:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{selectedRecord.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <Badge variant={selectedRecord.status === 'PAID' ? 'default' : 'secondary'}>
                    {selectedRecord.status}
                  </Badge>
                </div>
                {selectedRecord.paidDate && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Paid On:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRecord.paidDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPayslipDialog(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedRecord.status === 'PAID' && (
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Email to Employee
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
