/**
 * FR-USER-014: Student Health Records
 * Medical information and health tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { use } from 'react';

export default function StudentHealthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: student } = useQuery({
    queryKey: ['student', id],
    queryFn: () => userService.getStudent(id),
  });

  const { data: healthRecords, isLoading, refetch } = useQuery({
    queryKey: ['student-health', id],
    queryFn: () => userService.getStudentHealthRecords(id),
  });

  useEffect(() => {
    if (healthRecords) {
      setFormData({
        bloodGroup: healthRecords.bloodGroup || '',
        height: healthRecords.height || '',
        weight: healthRecords.weight || '',
        allergies: healthRecords.allergies?.join(', ') || '',
        chronicConditions: healthRecords.chronicConditions?.join(', ') || '',
        medications: healthRecords.medications?.join(', ') || '',
        emergencyContactName: healthRecords.emergencyContactName || '',
        emergencyContactPhone: healthRecords.emergencyContactPhone || '',
        emergencyContactRelation: healthRecords.emergencyContactRelation || '',
        doctorName: healthRecords.doctorName || '',
        doctorPhone: healthRecords.doctorPhone || '',
        insuranceProvider: healthRecords.insuranceProvider || '',
        insuranceNumber: healthRecords.insuranceNumber || '',
        notes: healthRecords.notes || '',
      });
    }
  }, [healthRecords]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateStudentHealthRecords(id, {
      ...data,
      allergies: data.allergies?.split(',').map((s: string) => s.trim()).filter(Boolean),
      chronicConditions: data.chronicConditions?.split(',').map((s: string) => s.trim()).filter(Boolean),
      medications: data.medications?.split(',').map((s: string) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      toast.success('Health records updated successfully');
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update health records');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  return (
    <Can permission={PERMISSIONS.STUDENTS_VIEW}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
            <p className="mt-2 text-sm text-gray-600">
              {student?.fullName} - Medical information and health tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Health Records
                </Button>
              )}
            </Can>
            <Button variant="outline" onClick={() => router.push(`/students/${id}`)}>
              Back to Profile
            </Button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Health Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <Input
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies (comma-separated)
                  </label>
                  <Textarea
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                    placeholder="e.g., Peanuts, Penicillin"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions (comma-separated)
                  </label>
                  <Textarea
                    value={formData.chronicConditions}
                    onChange={(e) => handleChange('chronicConditions', e.target.value)}
                    placeholder="e.g., Asthma, Diabetes"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications (comma-separated)
                  </label>
                  <Textarea
                    value={formData.medications}
                    onChange={(e) => handleChange('medications', e.target.value)}
                    placeholder="e.g., Insulin, Inhaler"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <Input
                      value={formData.emergencyContactName}
                      onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <Input
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor & Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Name
                    </label>
                    <Input
                      value={formData.doctorName}
                      onChange={(e) => handleChange('doctorName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.doctorPhone}
                      onChange={(e) => handleChange('doctorPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Provider
                    </label>
                    <Input
                      value={formData.insuranceProvider}
                      onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Number
                    </label>
                    <Input
                      value={formData.insuranceNumber}
                      onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Health Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-lg">{healthRecords?.bloodGroup || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-medium">{healthRecords?.height ? `${healthRecords.height} cm` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">{healthRecords?.weight ? `${healthRecords.weight} kg` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="font-medium">
                    {healthRecords?.height && healthRecords?.weight
                      ? ((healthRecords.weight / Math.pow(healthRecords.height / 100, 2)).toFixed(1))
                      : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {healthRecords?.allergies && healthRecords.allergies.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Allergies Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {healthRecords.allergies.map((allergy: string, idx: number) => (
                      <Badge key={idx} variant="error">{allergy}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  {healthRecords?.chronicConditions && healthRecords.chronicConditions.length > 0 ? (
                    <ul className="space-y-2">
                      {healthRecords.chronicConditions.map((condition: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No chronic conditions recorded</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  {healthRecords?.medications && healthRecords.medications.length > 0 ? (
                    <ul className="space-y-2">
                      {healthRecords.medications.map((med: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No medications recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Contact Name</p>
                  <p className="font-medium">{healthRecords?.emergencyContactName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Phone</p>
                  <p className="font-medium">{healthRecords?.emergencyContactPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-medium">{healthRecords?.emergencyContactRelation || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor & Insurance</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Doctor Name</p>
                  <p className="font-medium">{healthRecords?.doctorName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor Phone</p>
                  <p className="font-medium">{healthRecords?.doctorPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Insurance Provider</p>
                  <p className="font-medium">{healthRecords?.insuranceProvider || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Insurance Number</p>
                  <p className="font-mono">{healthRecords?.insuranceNumber || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {healthRecords?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{healthRecords.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Can>
  );
}
