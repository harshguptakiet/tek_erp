'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react';

const paymentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeStructureId: z.string().min(1, 'Fee structure is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'], {
    message: 'Payment method is required',
  }),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface FeeCollectionFormProps {
  studentId?: string;
  feeStructureId?: string;
  dueAmount?: number;
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CARD', label: 'Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: DollarSign },
  { value: 'CHEQUE', label: 'Cheque', icon: DollarSign },
];

export function FeeCollectionForm({
  studentId,
  feeStructureId,
  dueAmount,
  onSubmit,
  isLoading,
}: FeeCollectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: studentId || '',
      feeStructureId: feeStructureId || '',
      amount: dueAmount || 0,
    },
  });

  const selectedMethod = watch('paymentMethod');
  const amount = watch('amount');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Collecting Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">₹{amount || 0}</span>
              {dueAmount && (
                <span className="text-sm text-gray-500">of ₹{dueAmount} due</span>
              )}
            </div>
          </div>
          <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
        </div>
      </Card>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Amount *</label>
        <Input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          placeholder="Enter amount"
        />
        {dueAmount && amount > dueAmount && (
          <p className="mt-1 text-sm text-amber-600">
            Amount exceeds due amount. Excess will be adjusted.
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium mb-2">Payment Method *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.value}
                className={`
                  relative flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    selectedMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value={method.value}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <Icon className={`w-6 h-6 ${
                  selectedMethod === method.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">{method.label}</span>
                {selectedMethod === method.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Transaction ID (for non-cash payments) */}
      {selectedMethod && selectedMethod !== 'CASH' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction/Reference ID
            {selectedMethod === 'CHEQUE' && ' (Cheque Number)'}
          </label>
          <Input
            {...register('transactionId')}
            error={errors.transactionId?.message}
            placeholder={
              selectedMethod === 'CHEQUE'
                ? 'Enter cheque number'
                : 'Enter transaction ID'
            }
          />
        </div>
      )}

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
        <Textarea
          {...register('remarks')}
          placeholder="Add any additional notes"
          rows={3}
        />
      </div>

      {/* Summary */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">₹{amount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Method:</span>
            <Badge variant="secondary">
              {PAYMENT_METHODS.find((m) => m.value === selectedMethod)?.label || 'Not selected'}
            </Badge>
          </div>
          {dueAmount && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount:</span>
                <span className="font-medium">₹{dueAmount}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-semibold">
                <span>Remaining:</span>
                <span className={dueAmount - (amount || 0) < 0 ? 'text-amber-600' : 'text-green-600'}>
                  ₹{Math.max(0, dueAmount - (amount || 0))}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Processing...' : 'Collect Payment'}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
