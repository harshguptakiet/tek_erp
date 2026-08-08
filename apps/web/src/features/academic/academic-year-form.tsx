/**
 * Academic Year Form Component
 * Create and edit academic years with terms/semesters
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const termSchema = z.object({
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  order: z.number(),
});

const academicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isCurrent: z.boolean(),
  terms: z.array(termSchema).min(1, 'At least one term is required'),
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;
type Term = z.infer<typeof termSchema>;

interface AcademicYearFormProps {
  initialData?: AcademicYearFormData;
  onSubmit: (data: AcademicYearFormData) => Promise<void>;
  onCancel: () => void;
}

export function AcademicYearForm({
  initialData,
  onSubmit,
  onCancel,
}: AcademicYearFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terms, setTerms] = useState<Term[]>(
    initialData?.terms || [
      { name: 'Term 1', startDate: '', endDate: '', order: 1 },
      { name: 'Term 2', startDate: '', endDate: '', order: 2 },
    ]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: initialData || {
      name: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      terms: [],
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const isCurrent = watch('isCurrent');

  const addTerm = () => {
    const newTerm: Term = {
      name: `Term ${terms.length + 1}`,
      startDate: '',
      endDate: '',
      order: terms.length + 1,
    };
    setTerms([...terms, newTerm]);
  };

  const removeTerm = (index: number) => {
    if (terms.length > 1) {
      const newTerms = terms.filter((_, i) => i !== index);
      // Reorder remaining terms
      const reorderedTerms = newTerms.map((term, idx) => ({
        ...term,
        order: idx + 1,
      }));
      setTerms(reorderedTerms);
    }
  };

  const updateTerm = (index: number, field: keyof Term, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = { ...newTerms[index], [field]: value };
    setTerms(newTerms);
  };

  const handleFormSubmit = async (data: Omit<AcademicYearFormData, 'terms'>) => {
    setIsSubmitting(true);
    try {
      // Validate terms have dates
      const invalidTerms = terms.filter((t) => !t.startDate || !t.endDate);
      if (invalidTerms.length > 0) {
        throw new Error('All terms must have start and end dates');
      }

      await onSubmit({ ...data, terms });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Academic Year Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Academic Year Name *</Label>
            <Input
              {...register('name')}
              placeholder="e.g., 2026-2027"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  {...register('startDate')}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label>End Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  {...register('endDate')}
                  min={startDate}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Duration:</strong> {calculateDuration(startDate, endDate)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCurrent}
              onCheckedChange={(checked) => setValue('isCurrent', checked as boolean)}
            />
            <Label className="cursor-pointer">Mark as Current Academic Year</Label>
          </div>

          {isCurrent && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Setting this as current will automatically mark other years as inactive.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Terms/Semesters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Terms / Semesters</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTerm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>

        <div className="space-y-4">
          {terms.map((term, index) => (
            <Card key={index} className="p-4 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="flex items-center pt-8">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Term {index + 1}</Badge>
                    {terms.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTerm(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Term Name</Label>
                    <Input
                      value={term.name}
                      onChange={(e) => updateTerm(index, 'name', e.target.value)}
                      placeholder="e.g., First Semester"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={term.startDate}
                        onChange={(e) => updateTerm(index, 'startDate', e.target.value)}
                        min={startDate}
                        max={endDate}
                      />
                    </div>

                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={term.endDate}
                        onChange={(e) => updateTerm(index, 'endDate', e.target.value)}
                        min={term.startDate || startDate}
                        max={endDate}
                      />
                    </div>
                  </div>

                  {term.startDate && term.endDate && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {calculateDuration(term.startDate, term.endDate)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {errors.terms && (
          <p className="text-sm text-red-500 mt-2">{errors.terms.message}</p>
        )}
      </Card>

      {/* Important Notes */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
          <li>Academic year dates cannot overlap with existing years</li>
          <li>Terms must be within the academic year date range</li>
          <li>Only one academic year can be marked as current</li>
          <li>Changing the current academic year will affect all modules</li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Academic Year' : 'Create Academic Year'}
        </Button>
      </div>
    </form>
  );
}
