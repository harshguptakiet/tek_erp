/**
 * Module 30: Certificates & ID Cards - Certificates Management
 * FR-CERT-001 to FR-CERT-010: Generate and manage certificates
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { certificateService } from '@/services/certificate.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Real API integration
  const { data: certificatesResponse, isLoading } = useQuery({
    queryKey: ['certificates', user?.schoolId, selectedType, selectedStatus],
    queryFn: () =>
      certificateService.listCertificates({
        schoolId: user?.schoolId,
        certificateType: selectedType || undefined,
        status: selectedStatus || undefined,
      }),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const certificates = Array.isArray(certificatesResponse)
    ? certificatesResponse
    : certificatesResponse?.data || [];

  const filteredCertificates = certificates.filter((cert: any) => {
    const matchesSearch =
      cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalCertificates = certificates.length;
  const issuedCount = certificates.filter((c: any) => c.status === 'issued').length;
  const pendingCount = certificates.filter((c: any) => c.status === 'pending').length;

  const handleDownload = (id: string) => {
    toast.success('Downloading certificate...');
    // In real implementation: window.open(`/api/certificates/${id}/download`);
  };

  const handleVerify = (certificateNumber: string) => {
    router.push(`/certificates/verify/${certificateNumber}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generate and manage student certificates
            </p>
          </div>
          <Can permission={PERMISSIONS.CERTIFICATES_GENERATE}>
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
            <p className="text-sm text-gray-600">Total Certificates</p>
            <p className="text-3xl font-bold text-gray-900">{totalCertificates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Issued</p>
            <p className="text-3xl font-bold text-green-600">{issuedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-blue-600">
              {certificates.filter((c: any) => {
                const date = new Date(c.issuedDate);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by student or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">All Types</option>
              <option value="COMPLETION">Completion</option>
              <option value="ACHIEVEMENT">Achievement</option>
              <option value="PARTICIPATION">Participation</option>
              <option value="MERIT">Merit</option>
              <option value="TRANSFER">Transfer</option>
              <option value="CHARACTER">Character</option>
            </Select>
            <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading certificates...</p>
            </div>
          ) : filteredCertificates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert: any) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {cert.certificateNumber || '-'}
                    </TableCell>
                    <TableCell>{cert.studentName || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {cert.certificateType?.replace('_', ' ') || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cert.issuedDate
                        ? new Date(cert.issuedDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {cert.validUntil
                        ? new Date(cert.validUntil).toLocaleDateString()
                        : 'Lifetime'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cert.status === 'issued'
                            ? 'success'
                            : cert.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {cert.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/certificates/${cert.id}`)}
                        >
                          View
                        </Button>
                        <Can permission={PERMISSIONS.CERTIFICATES_GENERATE}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(cert.id)}
                          >
                            Download
                          </Button>
                        </Can>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerify(cert.certificateNumber)}
                        >
                          Verify
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎓</span>
              <p className="text-gray-600">No certificates found</p>
              <Can permission={PERMISSIONS.CERTIFICATES_GENERATE}>
                <Button className="mt-4" onClick={() => router.push('/certificates/generate')}>
                  Generate First Certificate
                </Button>
              </Can>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
