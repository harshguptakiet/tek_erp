/**
 * Module 06: Certificates & IDs - Certificate Management
 * FR-CERT-001: Generate and manage student certificates
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type CertificateType = 
  | 'COMPLETION'
  | 'ACHIEVEMENT'
  | 'PARTICIPATION'
  | 'MERIT'
  | 'CONDUCT'
  | 'TRANSFER'
  | 'BONAFIDE';

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  class: string;
  type: CertificateType;
  title: string;
  issuedDate: string;
  status: 'DRAFT' | 'ISSUED' | 'REVOKED';
  certificateNumber: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CertificateType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'ISSUED' | 'REVOKED'>('ALL');

  // Mock data
  const { data: certificatesData, isLoading } = useQuery({
    queryKey: ['certificates', searchQuery, filterType, filterStatus],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'cert1',
          studentId: 's1',
          studentName: 'Aarav Kumar',
          admissionNumber: 'ADM001',
          class: 'Class 10-A',
          type: 'COMPLETION' as CertificateType,
          title: 'Course Completion Certificate',
          issuedDate: '2024-07-15',
          status: 'ISSUED' as const,
          certificateNumber: 'CERT/2024/001',
        },
        {
          id: 'cert2',
          studentId: 's2',
          studentName: 'Priya Sharma',
          admissionNumber: 'ADM002',
          class: 'Class 10-A',
          type: 'ACHIEVEMENT' as CertificateType,
          title: 'Academic Excellence Award',
          issuedDate: '2024-07-20',
          status: 'ISSUED' as const,
          certificateNumber: 'CERT/2024/002',
        },
        {
          id: 'cert3',
          studentId: 's3',
          studentName: 'Rahul Verma',
          admissionNumber: 'ADM003',
          class: 'Class 11-B',
          type: 'PARTICIPATION' as CertificateType,
          title: 'Sports Day Participation',
          issuedDate: '2024-07-25',
          status: 'ISSUED' as const,
          certificateNumber: 'CERT/2024/003',
        },
        {
          id: 'cert4',
          studentId: 's4',
          studentName: 'Ananya Singh',
          admissionNumber: 'ADM004',
          class: 'Class 9-C',
          type: 'MERIT' as CertificateType,
          title: 'First Rank Certificate',
          issuedDate: '2024-07-30',
          status: 'DRAFT' as const,
          certificateNumber: 'CERT/2024/004',
        },
        {
          id: 'cert5',
          studentId: 's5',
          studentName: 'Arjun Patel',
          admissionNumber: 'ADM005',
          class: 'Class 12-A',
          type: 'TRANSFER' as CertificateType,
          title: 'Transfer Certificate',
          issuedDate: '2024-08-01',
          status: 'ISSUED' as const,
          certificateNumber: 'CERT/2024/005',
        },
        {
          id: 'cert6',
          studentId: 's6',
          studentName: 'Diya Reddy',
          admissionNumber: 'ADM006',
          class: 'Class 10-B',
          type: 'BONAFIDE' as CertificateType,
          title: 'Bonafide Certificate',
          issuedDate: '2024-08-02',
          status: 'ISSUED' as const,
          certificateNumber: 'CERT/2024/006',
        },
      ] as Certificate[];
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (certId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return certId;
    },
    onSuccess: () => {
      toast.success('Certificate downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download certificate');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (certId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return certId;
    },
    onSuccess: () => {
      toast.success('Certificate revoked successfully');
    },
    onError: () => {
      toast.error('Failed to revoke certificate');
    },
  });

  const filteredCertificates = certificatesData?.filter((cert) => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || cert.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || cert.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: certificatesData?.length || 0,
    issued: certificatesData?.filter((c) => c.status === 'ISSUED').length || 0,
    draft: certificatesData?.filter((c) => c.status === 'DRAFT').length || 0,
    revoked: certificatesData?.filter((c) => c.status === 'REVOKED').length || 0,
  };

  const getCertificateTypeColor = (type: CertificateType) => {
    const colors = {
      COMPLETION: 'bg-blue-100 text-blue-800',
      ACHIEVEMENT: 'bg-yellow-100 text-yellow-800',
      PARTICIPATION: 'bg-green-100 text-green-800',
      MERIT: 'bg-purple-100 text-purple-800',
      CONDUCT: 'bg-indigo-100 text-indigo-800',
      TRANSFER: 'bg-orange-100 text-orange-800',
      BONAFIDE: 'bg-pink-100 text-pink-800',
    };
    return colors[type];
  };


  return (
    <Can
      permission={PERMISSIONS.CONTENT_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view certificates</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
              <p className="mt-2 text-sm text-gray-600">
                Generate and manage student certificates and documents
              </p>
            </div>
            <Can permission={PERMISSIONS.CONTENT_CREATE}>
              <Button onClick={() => router.push('/certificates/generate')}>
                + Generate Certificate
              </Button>
            </Can>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Issued</p>
                <p className="text-3xl font-bold text-green-600">{stats.issued}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-3xl font-bold text-orange-600">{stats.draft}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Revoked</p>
                <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by student name, admission number, or certificate number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="COMPLETION">Completion</option>
                <option value="ACHIEVEMENT">Achievement</option>
                <option value="PARTICIPATION">Participation</option>
                <option value="MERIT">Merit</option>
                <option value="CONDUCT">Conduct</option>
                <option value="TRANSFER">Transfer</option>
                <option value="BONAFIDE">Bonafide</option>
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ISSUED">Issued</option>
                <option value="DRAFT">Draft</option>
                <option value="REVOKED">Revoked</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates List */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates ({filteredCertificates?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading certificates...</p>
              </div>
            ) : filteredCertificates && filteredCertificates.length > 0 ? (
              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">📜</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                            <p className="text-sm text-gray-600">
                              {cert.studentName} • {cert.admissionNumber} • {cert.class}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <Badge className={getCertificateTypeColor(cert.type)}>
                            {cert.type}
                          </Badge>

                          <Badge
                            variant={
                              cert.status === 'ISSUED'
                                ? 'success'
                                : cert.status === 'DRAFT'
                                ? 'warning'
                                : 'error'
                            }
                          >
                            {cert.status}
                          </Badge>

                          <span className="text-xs text-gray-500">
                            {cert.certificateNumber}
                          </span>

                          <span className="text-xs text-gray-500">
                            Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/certificates/${cert.id}`)}
                        >
                          View
                        </Button>

                        {cert.status === 'ISSUED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => downloadMutation.mutate(cert.id)}
                              disabled={downloadMutation.isPending}
                            >
                              Download
                            </Button>

                            <Can permission={PERMISSIONS.CONTENT_DELETE}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Are you sure you want to revoke this certificate?')) {
                                    revokeMutation.mutate(cert.id);
                                  }
                                }}
                                disabled={revokeMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                Revoke
                              </Button>
                            </Can>
                          </>
                        )}

                        {cert.status === 'DRAFT' && (
                          <Can permission={PERMISSIONS.CONTENT_UPDATE}>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/certificates/${cert.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </Can>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No certificates found</p>
                <Can permission={PERMISSIONS.CONTENT_CREATE}>
                  <Button onClick={() => router.push('/certificates/generate')}>
                    Generate First Certificate
                  </Button>
                </Can>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
