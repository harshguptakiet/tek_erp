/**
 * Child Grades View for Parents
 */

'use client';

import { useParams } from 'next/navigation';
import { useChildGrades } from '@/features/parent/use-parent';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ChildGradesPage() {
  const params = useParams();
  const childId = params.id as string;

  const { data: grades } = useChildGrades(childId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Performance</h1>
        <p className="text-muted-foreground">View grades and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Overall Grade</div>
          <div className="text-3xl font-bold">{grades?.overallGrade || 'N/A'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Percentage</div>
          <div className="text-3xl font-bold text-blue-600">{grades?.overallPercentage.toFixed(1)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Class Rank</div>
          <div className="text-3xl font-bold text-purple-600">{grades?.classRank || 'N/A'}</div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Subject-wise Performance</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {grades?.subjects?.map((subject: any) => (
              <div key={subject.subjectId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{subject.subjectName}</h4>
                  <Badge className={
                    subject.currentGrade === 'A+' || subject.currentGrade === 'A' 
                      ? 'bg-green-100 text-green-800' :
                    subject.currentGrade === 'B' || subject.currentGrade === 'B+' 
                      ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                  }>
                    {subject.currentGrade}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Percentage:</span>
                  <span className="font-semibold">{subject.percentage.toFixed(1)}%</span>
                </div>
                {subject.rank && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rank:</span>
                    <span className="font-semibold">{subject.rank}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
