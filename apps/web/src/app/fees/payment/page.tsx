/**
 * Module 07: Finance - Payment Processing
 * FR-FEE-011 to FR-FEE-015: Process payments and generate receipts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

// Validation schema
const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['ONLINE', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE', 'CARD']),
  transactionId: z.string().optional(),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  upiId: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentProcessingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Mock data - replace with actual API call
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pending-payment'],
    queryFn: async () => ({
      student: {
        id: 's1',
        name: 'Aarav Kumar',
        class: 'Class 10',
        section: 'A',
        admissionNumber: 'ADM2024001',
      },
      academicYear: '2024-2025',
      pendingPayment: {
        term: 'Q4 (Jan-Mar 2025)',
        dueDate: '2025-01-01',
        components: [
          { id: 'c1', name: 'Tuition Fee', amount: 16000, mandatory: true, selected: true },
          { id: 'c2', name: 'Lab Fee', amount: 2500, mandatory: true, selected: true },
          { id: 'c3', name: 'Library Fee', amount: 1000, mandatory: true, selected: true },
          { id: 'c4', name: 'Exam Fee', amount: 2000, mandatory: true, selected: true },
          { id: 'c5', name: 'Sports Fee', amount: 1500, mandatory: false, selected: true },
          { id: 'c6', name: 'Activity Fee', amount: 1000, mandatory: false, selected: true },
        ],
        totalAmount: 24000,
        minimumAmount: 21500, // Mandatory fees
        discount: 0,
        lateFee: 0,
      },
    }),
  });

  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentForm>({
    resolver: formResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'ONLINE',
      amount: pendingData?.pendingPayment.totalAmount || 0,
    },
  });

  const paymentMethod = watch('paymentMethod');

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return {
        receiptNumber: `RCP${Date.now()}`,
        transactionId: data.transactionId || `TXN${Date.now()}`,
        amount: data.amount,
        date: new Date().toISOString(),
        status: 'SUCCESS',
      };
    },
    onSuccess: (result) => {
      setPaymentResult(result);
      setStep('confirmation');
      toast.success('Payment processed successfully');
    },
    onError: () => {
      toast.error('Payment failed. Please try again');
    },
  });

  const toggleComponent = (componentId: string) => {
    if (selectedComponents.includes(componentId)) {
      setSelectedComponents(selectedComponents.filter(id => id !== componentId));
    } else {
      setSelectedComponents([...selectedComponents, componentId]);
    }
  };

  const calculateTotal = () => {
    if (!pendingData) return 0;
    return pendingData.pendingPayment.components
      .filter((c: any) => selectedComponents.includes(c.id))
      .reduce((sum: number, c: any) => sum + c.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <Can
      permission={PERMISSIONS.FEES_PAY}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to make payments</p>
            <Button className="mt-4" onClick={() => router.push('/fees')}>
              Back to Fees
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/fees')}>
              ← Back to Fees
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Process Payment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your fee payment for {pendingData?.academicYear}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'review', title: 'Review' },
              { id: 'payment', title: 'Payment' },
              { id: 'confirmation', title: 'Confirmation' },
            ].map((s, idx) => (
              <div key={s.id} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step === s.id || (s.id === 'review' && step !== 'review')
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        (s.id === 'review' && step !== 'review') ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <p className="text-sm mt-2 text-gray-600">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Review */}
        {step === 'review' && (
          <>
            {/* Student Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{pendingData?.student.name}</p>
                    <p className="text-sm text-gray-600">
                      {pendingData?.student.class} - Section {pendingData?.student.section} •{' '}
                      {pendingData?.student.admissionNumber}
                    </p>
                  </div>
                  <Badge variant="info">{pendingData?.academicYear}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Details - {pendingData?.pendingPayment.term}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Select components to pay:</p>
                  <div className="space-y-2">
                    {pendingData?.pendingPayment.components.map((component: any) => (
                      <div
                        key={component.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedComponents.includes(component.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${component.mandatory ? 'bg-orange-25' : ''}`}
                        onClick={() => !component.mandatory && toggleComponent(component.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedComponents.includes(component.id)}
                              onChange={() => !component.mandatory && toggleComponent(component.id)}
                              disabled={component.mandatory}
                              className="rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{component.name}</p>
                              {component.mandatory && (
                                <p className="text-xs text-orange-600">Mandatory</p>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{component.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  {pendingData?.pendingPayment?.discount != null && pendingData.pendingPayment.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-₹{pendingData.pendingPayment.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {pendingData?.pendingPayment?.lateFee != null && pendingData.pendingPayment.lateFee > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Late Fee:</span>
                      <span>+₹{pendingData.pendingPayment.lateFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    ℹ️ Due Date: {pendingData?.pendingPayment?.dueDate
                      ? new Date(pendingData.pendingPayment.dueDate).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={() => setStep('payment')}
              disabled={totalAmount < (pendingData?.pendingPayment.minimumAmount || 0)}
            >
              Proceed to Payment
            </Button>
          </>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <form onSubmit={handleSubmit((data) => paymentMutation.mutate(data))}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Payment Method *
                  </label>
                  <Select {...register('paymentMethod')}>
                    <option value="ONLINE">Online Payment (Credit/Debit Card)</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Pay *
                  </label>
                  <Input
                    type="number"
                    {...register('amount', { valueAsNumber: true })}
                    value={totalAmount}
                    readOnly
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                  )}
                </div>

                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <Input {...register('upiId')} placeholder="yourname@upi" />
                  </div>
                )}

                {paymentMethod === 'CHEQUE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Number *
                      </label>
                      <Input {...register('chequeNumber')} placeholder="123456" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <Input {...register('bankName')} placeholder="State Bank of India" />
                    </div>
                  </>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID *
                    </label>
                    <Input {...register('transactionId')} placeholder="TXN123456789" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <Input {...register('notes')} placeholder="Add any additional notes" />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && paymentResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your payment has been processed successfully
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Receipt Number</p>
                      <p className="font-semibold text-gray-900">{paymentResult.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold text-gray-900">{paymentResult.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-semibold text-green-600">
                        ₹{paymentResult.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(paymentResult.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => router.push('/fees/history')}>
                    View Payment History
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    Print Receipt
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/fees')}>
                    Back to Fees
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Can>
  );
}
