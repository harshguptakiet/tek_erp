/**
 * Academic Year Management Page
 * Manage academic years, terms, and student promotions
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AcademicYearForm } from '@/features/academic/academic-year-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Check,
  ArrowRight,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

interface Term {
  name: string;
  startDate: string;
  endDate: string;
  order: number;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'upcoming' | 'active' | 'completed';
  studentCount?: number;
  terms?: Term[];
  createdAt?: string;
}

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId),
  });

  const academicYears: AcademicYear[] = Array.isArray(yearsData)
    ? yearsData
    : yearsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => academicService.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create academic year');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      academicService.updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year updated successfully');
      setIsEditModalOpen(false);
      setSelectedYear(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update academic year');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicService.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete academic year');
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: (id: string) => academicService.setCurrentAcademicYear(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      const year = academicYears.find((y) => y.id === id);
      toast.success(`${year?.name || 'Selected year'} is now the current academic year`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to set current academic year');
    },
  });

  const handleCreate = async (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedYear) return;
    updateMutation.mutate({ id: selectedYear.id, data });
  };

  const handleDelete = (year: AcademicYear) => {
    if (year.isCurrent) {
      toast.error('Cannot delete current academic year');
      return;
    }

    if ((year.studentCount || 0) > 0) {
      if (!confirm(`This year has ${year.studentCount} students. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete ${year.name}?`)) {
        return;
      }
    }

    deleteMutation.mutate(year.id);
  };

  const handleSetCurrent = (year: AcademicYear) => {
    if (year.isCurrent) return;
    setCurrentMutation.mutate(year.id);
  };

  const getStatusBadge = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return <Badge className="bg-emerald-500 text-white">Current</Badge>;
    }

    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return 12;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[hsl(var(--primary))]" />
            Academic Year Management
          </h1>
          <p className="page-description">Manage academic years, terms, and student promotions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="text-white text-sm"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Academic Year
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 stat-card stat-card-blue">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Years</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{academicYears.length}</p>
        </div>
        <div className="card-premium p-5 stat-card stat-card-green">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Active Students</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {academicYears.find((y) => y.isCurrent)?.studentCount || 0}
          </p>
        </div>
        <div className="card-premium p-5 stat-card stat-card-purple">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Year</p>
          <p className="text-2xl font-bold mt-1">
            {academicYears.find((y) => y.isCurrent)?.name || 'None'}
          </p>
        </div>
        <div className="card-premium p-5 stat-card stat-card-orange">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Upcoming Year</p>
          <p className="text-2xl font-bold mt-1">
            {academicYears.find((y) => y.status === 'upcoming')?.name || 'None'}
          </p>
        </div>
      </div>

      {/* Academic Years List */}
      {isLoading ? (
        <div className="card-premium p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading academic years...</p>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <Calendar className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Academic Years Found</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
            Get started by creating your institution&apos;s first academic year.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Academic Year
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {academicYears.map((year) => (
            <div
              key={year.id}
              className={`card-premium p-6 ${year.isCurrent ? 'border-2 border-emerald-500 shadow-glow' : ''}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{year.name}</h3>
                      {getStatusBadge(year.status, year.isCurrent)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {year.startDate ? format(new Date(year.startDate), 'MMM dd, yyyy') : 'N/A'} -{' '}
                        {year.endDate ? format(new Date(year.endDate), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateDuration(year.startDate, year.endDate)} months
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {year.studentCount || 0} students
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!year.isCurrent && year.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={setCurrentMutation.isPending}
                        onClick={() => handleSetCurrent(year)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Set as Current
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedYear(year);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!year.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(year)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Terms */}
                {year.terms && year.terms.length > 0 && (
                  <div className="border-t border-[hsl(var(--border))] pt-4">
                    <h4 className="text-sm font-medium mb-3">Terms / Semesters ({year.terms.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {year.terms.map((term, index) => (
                        <div key={index} className="p-3 rounded-xl bg-[hsl(var(--secondary))] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{term.name}</Badge>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              {calculateDuration(term.startDate, term.endDate)} mos
                            </span>
                          </div>
                          <p className="text-[hsl(var(--muted-foreground))]">
                            {term.startDate ? format(new Date(term.startDate), 'MMM dd') : ''} -{' '}
                            {term.endDate ? format(new Date(term.endDate), 'MMM dd, yyyy') : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Academic Year</DialogTitle>
          </DialogHeader>
          <AcademicYearForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
          </DialogHeader>
          {selectedYear && (
            <AcademicYearForm
              initialData={{
                name: selectedYear.name,
                startDate: selectedYear.startDate,
                endDate: selectedYear.endDate,
                isCurrent: selectedYear.isCurrent,
                terms: selectedYear.terms || [],
              }}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedYear(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
