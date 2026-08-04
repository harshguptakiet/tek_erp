'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';

interface PerformanceChartsProps {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  dateRange?: { from: string; to: string };
}

export function PerformanceCharts({
  studentId,
  classId,
  subjectId,
  dateRange,
}: PerformanceChartsProps) {
  // Mock data - replace with real API calls
  const overallStats = {
    averageScore: 78.5,
    trend: 'up' as 'up' | 'down' | 'neutral',
    change: 5.2,
    rank: 12,
    totalStudents: 45,
    attendanceRate: 92.3,
    completionRate: 87.5,
  };

  const subjectPerformance = [
    { subject: 'Mathematics', score: 85, maxScore: 100, grade: 'A', trend: 'up', change: 3 },
    { subject: 'Science', score: 78, maxScore: 100, grade: 'B+', trend: 'up', change: 5 },
    { subject: 'English', score: 82, maxScore: 100, grade: 'A-', trend: 'neutral', change: 0 },
    { subject: 'History', score: 75, maxScore: 100, grade: 'B', trend: 'down', change: -2 },
    { subject: 'Geography', score: 88, maxScore: 100, grade: 'A', trend: 'up', change: 7 },
  ];

  const monthlyTrend = [
    { month: 'Jan', score: 72 },
    { month: 'Feb', score: 75 },
    { month: 'Mar', score: 73 },
    { month: 'Apr', score: 78 },
    { month: 'May', score: 80 },
    { month: 'Jun', score: 78.5 },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold mt-1">{overallStats.averageScore}%</p>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(overallStats.trend)}`}>
                {getTrendIcon(overallStats.trend)}
                <span className="text-sm font-medium">
                  {overallStats.change > 0 ? '+' : ''}
                  {overallStats.change}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-3xl font-bold mt-1">
                #{overallStats.rank}
                <span className="text-lg text-muted-foreground">
                  /{overallStats.totalStudents}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold mt-1">{overallStats.attendanceRate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${overallStats.attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold mt-1">{overallStats.completionRate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${overallStats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subject-wise Performance</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{subject.subject}</span>
                    <Badge variant="secondary">{subject.grade}</Badge>
                    <div className={`flex items-center gap-1 ${getTrendColor(subject.trend)}`}>
                      {getTrendIcon(subject.trend)}
                      <span className="text-sm">
                        {subject.change > 0 ? '+' : ''}
                        {subject.change}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {subject.score}/{subject.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      subject.score >= 80
                        ? 'bg-green-600'
                        : subject.score >= 60
                        ? 'bg-blue-600'
                        : 'bg-yellow-600'
                    }`}
                    style={{ width: `${(subject.score / subject.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {monthlyTrend.map((month, index) => {
              const maxScore = 100;
              const heightPercent = (month.score / maxScore) * 100;

              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full h-48 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer group"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {month.score}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Excellent in Mathematics (85%)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Strong Geography performance (88%)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Consistent attendance (92%+)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span className="text-sm">Good English communication (82%)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="text-sm">History needs attention (75%, declining)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                <span className="text-sm">Assignment completion rate low (87.5%)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                <span className="text-sm">Participation in class activities</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span className="text-sm">Time management for exams</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
