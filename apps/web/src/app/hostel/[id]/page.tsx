'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostelService } from '@/services/hostel.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Home,
  Users,
  Bed,
  CheckCircle,
  AlertCircle,
  Edit,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';

export default function HostelRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const roomId = params.id as string;
  const [studentId, setStudentId] = useState('');

  // Fetch room details
  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['hostel-room', roomId],
    queryFn: () => hostelService.getRoom(roomId),
    enabled: !!roomId,
  });

  // Fetch residents
  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ['room-residents', roomId],
    queryFn: () => hostelService.getResidents(roomId),
    enabled: !!roomId,
  });

  // Allocate room mutation
  const allocateMutation = useMutation({
    mutationFn: (data: { studentId: string; roomId: string; startDate: string }) =>
      hostelService.allocateRoom(data),
    onSuccess: () => {
      toast.success('Student allocated to room successfully');
      queryClient.invalidateQueries({ queryKey: ['hostel-room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['room-residents', roomId] });
      setStudentId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to allocate room');
    },
  });

  const handleAllocate = () => {
    if (!studentId) {
      toast.error('Please enter a student ID');
      return;
    }

    allocateMutation.mutate({
      studentId,
      roomId,
      startDate: new Date().toISOString(),
    });
  };

  const isLoading = roomLoading || residentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Room not found</p>
            <Button onClick={() => router.push('/hostel')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hostel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const occupancy = residents?.length || 0;
  const capacity = room.capacity || 0;
  const isAvailable = occupancy < capacity;
  const occupancyPercentage = capacity > 0 ? (occupancy / capacity) * 100 : 0;

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/hostel')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Room {room.roomNumber}</h1>
              <p className="text-muted-foreground">{room.hostel?.name || 'Hostel'}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/hostel/${roomId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Room
        </Button>
      </div>

      {/* Status */}
      <div className="mb-6">
        <Badge
          variant={isAvailable ? 'default' : 'secondary'}
          className={isAvailable ? 'bg-green-500' : 'bg-red-500'}
        >
          {isAvailable ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              {capacity - occupancy} Bed(s) Available
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Full Capacity
            </>
          )}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Room Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-semibold">{room.roomNumber}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Floor</p>
                <p className="font-semibold">Floor {room.floor || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <Badge variant="outline">{room.type || 'Standard'}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <Badge variant="outline">{room.gender || 'N/A'}</Badge>
              </div>
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {room.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed">{room.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <p className="text-3xl font-bold">{capacity}</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Beds</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Occupied</span>
                <span className="font-semibold">{occupancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-semibold text-green-600">
                  {capacity - occupancy}
                </span>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {occupancyPercentage.toFixed(0)}% Occupied
            </p>
          </CardContent>
        </Card>

        {/* Allocate Student */}
        {isAvailable && user?.permissions?.includes('hostel.allocate') && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Allocate Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter student ID or admission number"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAllocate}
                    disabled={allocateMutation.isPending || !studentId}
                  >
                    {allocateMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Allocate Room
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Residents */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Residents ({occupancy})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {residents && residents.length > 0 ? (
              <div className="space-y-3">
                {residents.map((resident: any) => (
                  <div
                    key={resident.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold">
                          {resident.student?.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{resident.student?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {resident.student?.class} - {resident.student?.section} •
                          ID: {resident.student?.admissionNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Allocated On</p>
                      <p className="font-semibold">
                        {new Date(resident.startDate).toLocaleDateString()}
                      </p>
                      {resident.bedNumber && (
                        <p className="text-xs text-muted-foreground">
                          Bed #{resident.bedNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No residents currently allocated
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
