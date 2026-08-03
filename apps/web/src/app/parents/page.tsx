/**
 * FR-USER-027 to FR-USER-032: Parent Management
 * List and manage parent/guardian profiles
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { getPaginatedItems, getPaginatedTotal } from '@/types';
import Image from 'next/image';

export default function ParentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['parents', { page, limit, search: searchQuery, status: statusFilter }],
    queryFn: () => userService.searchUsers(searchQuery, {
      role: 'PARENT',
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
    }),
  });

  const parents = getPaginatedItems(data);
  const total = getPaginatedTotal(data);
  const totalPages = Math.ceil(total / limit);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parents & Guardians</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage parent/guardian profiles and student links
            </p>
          </div>
          <Can permission={PERMISSIONS.PARENTS_CREATE}>
            <Button onClick={() => router.push('/parents/create')}>
              Add Parent
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Parents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {parents.filter((p: any) => p.status === 'ACTIVE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Children</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">1.8</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent/Guardian</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Linked Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2">No parents found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              parents.map((parent: any) => (
                <TableRow key={parent.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {parent.profilePicture ? (
                          <Image
                            src={parent.profilePicture}
                            alt={parent.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 text-sm font-bold">
                            {parent.firstName?.[0]}{parent.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{parent.fullName}</p>
                        <p className="text-sm text-gray-500">{parent.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{parent.phone || '-'}</p>
                      {parent.alternatePhone && (
                        <p className="text-gray-500">Alt: {parent.alternatePhone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parent.linkedStudents?.length > 0 ? (
                        <>
                          {parent.linkedStudents.slice(0, 2).map((student: any, idx: number) => (
                            <Badge key={idx} variant="info" className="text-xs">
                              {student.name}
                            </Badge>
                          ))}
                          {parent.linkedStudents.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{parent.linkedStudents.length - 2}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No students</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        parent.status === 'ACTIVE' ? 'success' :
                        parent.status === 'INACTIVE' ? 'secondary' : 'info'
                      }
                    >
                      {parent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Can permission={PERMISSIONS.PARENTS_VIEW}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/parents/${parent.id}`)}
                        >
                          View
                        </Button>
                      </Can>
                      <Can permission={PERMISSIONS.PARENTS_UPDATE}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/parents/${parent.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} parents
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
