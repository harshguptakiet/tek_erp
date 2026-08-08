/**
 * Child Attendance View for Parents
 */

'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useChildAttendance } from '@/features/parent/use-parent';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';

export default function ChildAttendancePage() {
  const params = useParams();
  const childId = params.id as string;
  const [dateRange, setDateRange] = useState({ 
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: attendance } = useChildAttendance(childId, dateRange);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Records</h1>
        <p className="text-muted-foreground">View detailed attendance history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Days</div>
          <div className="text-3xl font-bold">{attendance?.totalDays || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Present</div>
          <div className="text-3xl font-bold text-green-600">{attendance?.present || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Absent</div>
          <div className="text-3xl font-bold text-red-600">{attendance?.absent || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Percentage</div>
          <div className="text-3xl font-bold text-blue-600">{attendance?.attendancePercentage.toFixed(1)}%</div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Attendance</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {attendance?.recentAttendance?.map((record: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{format(new Date(record.date), 'EEEE, MMM dd, yyyy')}</div>
                  {record.remarks && <div className="text-sm text-muted-foreground">{record.remarks}</div>}
                </div>
                <Badge className={
                  record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                  record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
