'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Wallet, Building, CheckCircle } from 'lucide-react';
import { useRecordPayment } from './use-fees';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE']),
  paymentDate: z.date(),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
  sendReceipt: z.boolean().default(true),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface FeePaymentFormProps {
  feeId: string;
  studentId: string;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  onSuccess?: () => void;
}

export function FeePaymentForm({
  feeId,
  studentId,
  studentName,
  totalAmount,
  paidAmount,
  dueAmount,
  dueDate,
  onSuccess,
}: FeePaymentFormProps) {
  const router = useRouter();
  const recordPayment = useRecordPayment();
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: dueAmount,
      paymentDate: new Date(),
      sendReceipt: true,
    },
  });

  const amount = watch('amount');
  const sendReceipt = watch('sendReceipt');

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Wallet },
    { value: 'CARD', label: 'Card', icon: CreditCard },
    { value: 'UPI', label: 'UPI', icon: Wallet },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
    { value: 'CHEQUE', label: 'Cheque', icon: CheckCircle },
  ];

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await recordPayment.mutateAsync({
        feeId,
        studentId,
        ...data,
        paymentDate: paymentDate.toISOString(),
      });

      toast.success('Payment recorded successfully');
      onSuccess?.();
      router.push(`/fees/${feeId}`);
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Student & Fee Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">{studentName}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Fee</span>
            <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid Amount</span>
            <span className="font-medium text-green-600">
              ₹{paidAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Amount</span>
            <span className="font-bold text-red-600 text-lg">
              ₹{dueAmount.toLocaleString()}
            </span>
          </div>
          {dueDate && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <Badge variant="warning">
                  {new Date(dueDate).toLocaleDateString()}
                </Badge>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => {
                  setSelectedMethod(method.value);
                  setValue('paymentMethod', method.value as any);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm font-medium ${
                  isSelected ? 'text-primary' : 'text-gray-700'
                }`}>
                  {method.label}
                </p>
              </button>
            );
          })}
        </div>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500 mt-2">{errors.paymentMethod.message}</p>
        )}
      </Card>

      {/* Amount & Date */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              min="1"
              max={dueAmount}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setValue('amount', dueAmount / 2)}
              >
                Half Amount
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setValue('amount', dueAmount)}
              >
                Full Amount
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              date={paymentDate}
              onDateChange={(date) => {
                setPaymentDate(date!);
                setValue('paymentDate', date!);
              }}
              placeholder="Select payment date"
              toDate={new Date()}
            />
          </div>
        </div>
      </Card>

      {/* Reference & Remarks */}
      {selectedMethod && selectedMethod !== 'CASH' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reference Number
                {selectedMethod === 'CHEQUE' && <span className="text-red-500"> *</span>}
              </label>
              <Input
                {...register('referenceNumber')}
                placeholder={
                  selectedMethod === 'CHEQUE' ? 'Cheque Number' :
                  selectedMethod === 'UPI' ? 'Transaction ID' :
                  selectedMethod === 'BANK_TRANSFER' ? 'Transfer Reference' :
                  'Reference Number'
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input
                {...register('remarks')}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span>Amount Paying</span>
            <span className="font-bold text-green-600">
              ₹{(amount || 0).toLocaleString()}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span>Remaining Due</span>
            <span className="font-bold text-red-600">
              ₹{(dueAmount - (amount || 0)).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="sendReceipt"
            checked={sendReceipt}
            onCheckedChange={(checked) => setValue('sendReceipt', checked as boolean)}
          />
          <label htmlFor="sendReceipt" className="text-sm">
            Send payment receipt via email/SMS
          </label>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedMethod}>
          {isSubmitting ? 'Processing...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}
