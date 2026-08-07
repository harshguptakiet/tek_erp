/**
 * FR-USER-020: Edit Teacher Profile
 * Update teacher information with validation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { use } from 'react';

export default function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => userService.getTeacher(id),
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '',
        gender: teacher.gender || '',
        address: teacher.address || '',
        employeeId: teacher.employeeId || '',
        department: teacher.department || '',
        joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '',
        employmentType: teacher.employmentType || '',
        highestQualification: teacher.highestQualification || '',
        experienceYears: teacher.experienceYears || '',
        specialization: teacher.specialization || '',
        subjects: teacher.subjects?.join(', ') || '',
        salary: teacher.salary || '',
      });
    }
  }, [teacher]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateTeacher(id, data),
    onSuccess: () => {
      toast.success('Teacher profile updated successfully');
      router.push(`/teachers/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update teacher profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      subjects: formData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
    };

    updateMutation.mutate(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  return (
    <Can permission={PERMISSIONS.TEACHERS_UPDATE} fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">You don't have permission to edit teachers</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Teacher Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update teacher information and employment details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information - Same as create */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <Input
                    type="text"
                    value={formData.employeeId}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <Select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  >
                    <option value="">Select department</option>
                    <option value="MATHEMATICS">Mathematics</option>
                    <option value="SCIENCE">Science</option>
                    <option value="ENGLISH">English</option>
                    <option value="SOCIAL_STUDIES">Social Studies</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects Teaching
                </label>
                <Textarea
                  value={formData.subjects}
                  onChange={(e) => handleChange('subjects', e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/teachers/${id}`)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
