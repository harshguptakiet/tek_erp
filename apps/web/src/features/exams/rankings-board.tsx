'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentRank {
  rank: number;
  previousRank?: number;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  class: string;
  section: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
}

interface RankingsBoardProps {
  examId: string;
  rankings: StudentRank[];
  classRankings?: StudentRank[];
  sectionRankings?: StudentRank[];
  totalStudents: number;
}

export function RankingsBoard({
  examId,
  rankings,
  classRankings = [],
  sectionRankings = [],
  totalStudents,
}: RankingsBoardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <Award className="h-6 w-6 text-gray-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = previous - current;
    if (change > 0) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +{change}
        </Badge>
      );
    } else if (change < 0) {
      return (
        <Badge variant="error" className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          {change}
        </Badge>
      );
    }
    return <Badge variant="secondary">-</Badge>;
  };

  const renderRankingList = (data: StudentRank[]) => (
    <div className="space-y-3">
      {data.map((student, index) => {
        const isTopThree = student.rank <= 3;
        return (
          <Card
            key={student.studentId}
            className={cn(
              'p-4 transition-all hover:shadow-md',
              isTopThree && 'border-2 border-primary'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg',
                  getRankBadge(student.rank)
                )}
              >
                {isTopThree ? getRankIcon(student.rank) : student.rank}
              </div>

              {/* Student Info */}
              <Avatar className="w-12 h-12">
                <AvatarImage src={student.studentAvatar} alt={student.studentName} />
                <AvatarFallback>
                  {student.studentName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{student.studentName}</h3>
                  {getRankChange(student.rank, student.previousRank)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Class {student.class} - Section {student.section}
                </p>
              </div>

              {/* Scores */}
              <div className="text-right min-w-[120px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {student.obtainedMarks}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {student.totalMarks}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={student.percentage} className="w-20 h-2" />
                  <Badge
                    variant={
                      student.percentage >= 90 ? 'success' :
                      student.percentage >= 75 ? 'info' :
                      student.percentage >= 60 ? 'warning' : 'error'
                    }
                  >
                    {student.percentage}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Grade: <span className="font-bold">{student.grade}</span>
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 text-center">Top Performers</h2>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd Place */}
          {rankings[1] && (
            <div className="flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-2 ring-4 ring-gray-300">
                <AvatarImage src={rankings[1].studentAvatar} alt={rankings[1].studentName} />
                <AvatarFallback>
                  {rankings[1].studentName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center mb-2">
                <p className="font-bold">{rankings[1].studentName}</p>
                <p className="text-sm text-muted-foreground">{rankings[1].percentage}%</p>
              </div>
              <div className="w-32 h-24 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center">
                <Medal className="h-12 w-12 text-white" />
              </div>
              <div className="text-3xl font-bold text-white bg-gray-500 w-full text-center py-2 rounded-b-lg">
                2
              </div>
            </div>
          )}

          {/* 1st Place */}
          {rankings[0] && (
            <div className="flex flex-col items-center -mt-8">
              <Avatar className="w-24 h-24 mb-2 ring-4 ring-yellow-400">
                <AvatarImage src={rankings[0].studentAvatar} alt={rankings[0].studentName} />
                <AvatarFallback>
                  {rankings[0].studentName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center mb-2">
                <p className="font-bold text-lg">{rankings[0].studentName}</p>
                <p className="text-sm text-muted-foreground">{rankings[0].percentage}%</p>
              </div>
              <div className="w-32 h-32 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <div className="text-4xl font-bold text-white bg-yellow-600 w-full text-center py-2 rounded-b-lg">
                1
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {rankings[2] && (
            <div className="flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-2 ring-4 ring-orange-400">
                <AvatarImage src={rankings[2].studentAvatar} alt={rankings[2].studentName} />
                <AvatarFallback>
                  {rankings[2].studentName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center mb-2">
                <p className="font-bold">{rankings[2].studentName}</p>
                <p className="text-sm text-muted-foreground">{rankings[2].percentage}%</p>
              </div>
              <div className="w-32 h-20 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg flex items-center justify-center">
                <Medal className="h-10 w-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-white bg-orange-600 w-full text-center py-2 rounded-b-lg">
                3
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Rankings Tabs */}
      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">
            Overall ({rankings.length})
          </TabsTrigger>
          <TabsTrigger value="class">
            Class ({classRankings.length})
          </TabsTrigger>
          <TabsTrigger value="section">
            Section ({sectionRankings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          {renderRankingList(rankings)}
        </TabsContent>

        <TabsContent value="class" className="space-y-4">
          {classRankings.length > 0 ? (
            renderRankingList(classRankings)
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No class rankings available
            </Card>
          )}
        </TabsContent>

        <TabsContent value="section" className="space-y-4">
          {sectionRankings.length > 0 ? (
            renderRankingList(sectionRankings)
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No section rankings available
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
