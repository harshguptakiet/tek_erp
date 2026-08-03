/**
 * Module 06: Certificates & IDs - Student ID Card Generation
 * FR-ID-001: Generate and manage student ID cards
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

type IDCardStatus = 'PENDING' | 'GENERATED' | 'PRINTED' | 'ISSUED' | 'EXPIRED';

interface IDCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  class: string;
  rollNumber: string;
  photo?: string;
  bloodGroup: string;
  contactNumber: string;
  emergencyContact: string;
  validFrom: string;
  validUntil: string;
  status: IDCardStatus;
  cardNumber: string;
  generatedAt?: string;
  issuedAt?: string;
}

export default function IDCardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<IDCardStatus | 'ALL'>('ALL');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // Mock data
  const { data: idCardsData, isLoading } = useQuery({
    queryKey: ['id-cards', searchQuery, filterClass, filterStatus],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'id1',
          studentId: 's1',
          studentName: 'Aarav Kumar',
          admissionNumber: 'ADM001',
          class: 'Class 10-A',
          rollNumber: '1',
          bloodGroup: 'O+',
          contactNumber: '9876543210',
          emergencyContact: '9876543211',
          validFrom: '2024-04-01',
          validUntil: '2025-03-31',
          status: 'ISSUED' as IDCardStatus,
          cardNumber: 'ID2024001',
          generatedAt: '2024-04-01T10:00:00Z',
          issuedAt: '2024-04-05T14:30:00Z',
        },
        {
          id: 'id2',
          studentId: 's2',
          studentName: 'Priya Sharma',
          admissionNumber: 'ADM002',
          class: 'Class 10-A',
          rollNumber: '2',
          bloodGroup: 'A+',
          contactNumber: '9876543212',
          emergencyContact: '9876543213',
          validFrom: '2024-04-01',
          validUntil: '2025-03-31',
          status: 'PRINTED' as IDCardStatus,
          cardNumber: 'ID2024002',
          generatedAt: '2024-04-01T10:05:00Z',
        },
        {
          id: 'id3',
          studentId: 's3',
          studentName: 'Rahul Verma',
          admissionNumber: 'ADM003',
          class: 'Class 11-B',
          rollNumber: '3',
          bloodGroup: 'B+',
          contactNumber: '9876543214',
          emergencyContact: '9876543215',
          validFrom: '2024-04-01',
          validUntil: '2025-03-31',
          status: 'GENERATED' as IDCardStatus,
          cardNumber: 'ID2024003',
          generatedAt: '2024-04-02T09:00:00Z',
        },
        {
          id: 'id4',
          studentId: 's4',
          studentName: 'Ananya Singh',
          admissionNumber: 'ADM004',
          class: 'Class 9-C',
          rollNumber: '4',
          bloodGroup: 'AB+',
          contactNumber: '9876543216',
          emergencyContact: '9876543217',
          validFrom: '2024-04-01',
          validUntil: '2025-03-31',
          status: 'PENDING' as IDCardStatus,
          cardNumber: 'ID2024004',
        },
        {
          id: 'id5',
          studentId: 's5',
          studentName: 'Arjun Patel',
          admissionNumber: 'ADM005',
          class: 'Class 12-A',
          rollNumber: '5',
          bloodGroup: 'O-',
          contactNumber: '9876543218',
          emergencyContact: '9876543219',
          validFrom: '2023-04-01',
          validUntil: '2024-03-31',
          status: 'EXPIRED' as IDCardStatus,
          cardNumber: 'ID2023005',
          generatedAt: '2023-04-01T10:00:00Z',
          issuedAt: '2023-04-05T11:00:00Z',
        },
        {
          id: 'id6',
          studentId: 's6',
          studentName: 'Diya Reddy',
          admissionNumber: 'ADM006',
          class: 'Class 10-B',
          rollNumber: '6',
          bloodGroup: 'A-',
          contactNumber: '9876543220',
          emergencyContact: '9876543221',
          validFrom: '2024-04-01',
          validUntil: '2025-03-31',
          status: 'ISSUED' as IDCardStatus,
          cardNumber: 'ID2024006',
          generatedAt: '2024-04-01T10:10:00Z',
          issuedAt: '2024-04-05T15:00:00Z',
        },
      ] as IDCard[];
    },
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => [
      { id: 'c1', name: 'Class 9' },
      { id: 'c2', name: 'Class 10' },
      { id: 'c3', name: 'Class 11' },
      { id: 'c4', name: 'Class 12' },
    ],
  });

  const generateMutation = useMutation({
    mutationFn: async (cardIds: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return cardIds;
    },
    onSuccess: () => {
      toast.success('ID cards generated successfully');
      setSelectedCards([]);
    },
    onError: () => {
      toast.error('Failed to generate ID cards');
    },
  });

  const printMutation = useMutation({
    mutationFn: async (cardIds: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return cardIds;
    },
    onSuccess: () => {
      toast.success('ID cards sent to printer');
      setSelectedCards([]);
    },
    onError: () => {
      toast.error('Failed to print ID cards');
    },
  });

  const filteredCards = idCardsData?.filter((card) => {
    const matchesSearch = 
      card.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.cardNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'ALL' || card.class.includes(filterClass);
    const matchesStatus = filterStatus === 'ALL' || card.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = {
    total: idCardsData?.length || 0,
    pending: idCardsData?.filter((c) => c.status === 'PENDING').length || 0,
    generated: idCardsData?.filter((c) => c.status === 'GENERATED').length || 0,
    printed: idCardsData?.filter((c) => c.status === 'PRINTED').length || 0,
    issued: idCardsData?.filter((c) => c.status === 'ISSUED').length || 0,
    expired: idCardsData?.filter((c) => c.status === 'EXPIRED').length || 0,
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const selectAll = () => {
    if (selectedCards.length === filteredCards?.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredCards?.map((c) => c.id) || []);
    }
  };

  const getStatusBadge = (status: IDCardStatus) => {
    const badges = {
      PENDING: <Badge variant="warning">Pending</Badge>,
      GENERATED: <Badge variant="info">Generated</Badge>,
      PRINTED: <Badge className="bg-blue-600 text-white">Printed</Badge>,
      ISSUED: <Badge variant="success">Issued</Badge>,
      EXPIRED: <Badge variant="error">Expired</Badge>,
    };
    return badges[status];
  };


  return (
    <Can
      permission={PERMISSIONS.CONTENT_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view ID cards</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student ID Cards</h1>
              <p className="mt-2 text-sm text-gray-600">
                Generate, print, and manage student identification cards
              </p>
            </div>
            <Can permission={PERMISSIONS.CONTENT_CREATE}>
              <Button onClick={() => router.push('/id-cards/generate')}>
                + Generate ID Cards
              </Button>
            </Can>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('PENDING')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('GENERATED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Generated</p>
                <p className="text-3xl font-bold text-blue-600">{stats.generated}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('PRINTED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Printed</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.printed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('ISSUED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Issued</p>
                <p className="text-3xl font-bold text-green-600">{stats.issued}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('EXPIRED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name, admission number, or card number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="ALL">All Classes</option>
                {classesData?.map((cls: any) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="GENERATED">Generated</option>
                <option value="PRINTED">Printed</option>
                <option value="ISSUED">Issued</option>
                <option value="EXPIRED">Expired</option>
              </Select>

              <Button
                variant="outline"
                onClick={selectAll}
              >
                {selectedCards.length === filteredCards?.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {selectedCards.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCards.length} card(s) selected
                </span>
                <div className="flex-1" />
                <Can permission={PERMISSIONS.CONTENT_CREATE}>
                  <Button
                    size="sm"
                    onClick={() => generateMutation.mutate(selectedCards)}
                    disabled={generateMutation.isPending}
                  >
                    Generate Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => printMutation.mutate(selectedCards)}
                    disabled={printMutation.isPending}
                  >
                    Print Selected
                  </Button>
                </Can>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ID Cards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading ID cards...</p>
          </div>
        ) : filteredCards && filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                className={`hover:shadow-lg transition-shadow ${
                  selectedCards.includes(card.id) ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => toggleCardSelection(card.id)}
                        className="rounded"
                      />
                      <div>
                        <CardTitle className="text-lg">{card.studentName}</CardTitle>
                        <p className="text-xs text-gray-500">{card.cardNumber}</p>
                      </div>
                    </div>
                    {getStatusBadge(card.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Admission No:</span>
                      <span className="font-medium text-gray-900">{card.admissionNumber}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Class:</span>
                      <Badge variant="secondary">{card.class}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Roll No:</span>
                      <span className="font-medium text-gray-900">{card.rollNumber}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <Badge variant="error">{card.bloodGroup}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className={`text-xs ${
                        card.status === 'EXPIRED' ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {new Date(card.validUntil).toLocaleDateString()}
                      </span>
                    </div>

                    {card.generatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Generated:</span>
                        <span className="text-xs text-gray-900">
                          {new Date(card.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {card.issuedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Issued:</span>
                        <span className="text-xs text-gray-900">
                          {new Date(card.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/id-cards/${card.id}`)}
                    >
                      View Card
                    </Button>

                    {card.status === 'GENERATED' && (
                      <Can permission={PERMISSIONS.CONTENT_CREATE}>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => printMutation.mutate([card.id])}
                          disabled={printMutation.isPending}
                        >
                          Print
                        </Button>
                      </Can>
                    )}

                    {card.status === 'EXPIRED' && (
                      <Can permission={PERMISSIONS.CONTENT_CREATE}>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/id-cards/${card.id}/renew`)}
                        >
                          Renew
                        </Button>
                      </Can>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No ID cards found matching your criteria</p>
            <Can permission={PERMISSIONS.CONTENT_CREATE}>
              <Button onClick={() => router.push('/id-cards/generate')}>
                Generate ID Cards
              </Button>
            </Can>
          </div>
        )}

        {/* Quick Stats Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ID Card Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Issued Rate</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.total > 0 ? ((stats.issued / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Pending Generation</p>
                <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Ready to Print</p>
                <p className="text-2xl font-bold text-blue-700">{stats.generated}</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 mb-1">Expired</p>
                <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
