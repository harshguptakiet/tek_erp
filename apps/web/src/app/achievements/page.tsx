/**
 * Module 37: Gamification - Achievements and Badges
 * FR-GAMIF-001: Student achievements and gamification system
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

type AchievementCategory = 'ACADEMIC' | 'ATTENDANCE' | 'PARTICIPATION' | 'LEADERSHIP' | 'SPORTS' | 'ARTS';
type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
  requirements: string[];
}

interface Leaderboard {
  rank: number;
  studentName: string;
  class: string;
  totalPoints: number;
  achievements: number;
  trend: 'up' | 'down' | 'same';
}

export default function AchievementsPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>('achievements');

  // Mock achievements data
  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'ach1',
          title: 'Perfect Attendance',
          description: 'Maintain 100% attendance for a month',
          category: 'ATTENDANCE' as AchievementCategory,
          tier: 'GOLD' as AchievementTier,
          icon: '🎯',
          points: 500,
          isUnlocked: true,
          unlockedDate: '2024-07-31',
          progress: 30,
          maxProgress: 30,
          requirements: ['30 days of perfect attendance'],
        },
        {
          id: 'ach2',
          title: 'Academic Excellence',
          description: 'Score above 90% in all subjects',
          category: 'ACADEMIC' as AchievementCategory,
          tier: 'PLATINUM' as AchievementTier,
          icon: '🏆',
          points: 1000,
          isUnlocked: true,
          unlockedDate: '2024-07-15',
          progress: 5,
          maxProgress: 5,
          requirements: ['90%+ in all subjects', 'Complete all assignments'],
        },
        {
          id: 'ach3',
          title: 'Class Representative',
          description: 'Elected as class representative',
          category: 'LEADERSHIP' as AchievementCategory,
          tier: 'SILVER' as AchievementTier,
          icon: '👑',
          points: 750,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Win class elections'],
        },
        {
          id: 'ach4',
          title: 'Early Bird',
          description: 'Submit 10 assignments before deadline',
          category: 'ACADEMIC' as AchievementCategory,
          tier: 'BRONZE' as AchievementTier,
          icon: '🐦',
          points: 300,
          isUnlocked: false,
          progress: 7,
          maxProgress: 10,
          requirements: ['Submit 10 assignments early'],
        },
        {
          id: 'ach5',
          title: 'Sports Champion',
          description: 'Win first place in any sports event',
          category: 'SPORTS' as AchievementCategory,
          tier: 'GOLD' as AchievementTier,
          icon: '⚽',
          points: 600,
          isUnlocked: true,
          unlockedDate: '2024-06-20',
          progress: 1,
          maxProgress: 1,
          requirements: ['1st place in inter-class sports'],
        },
        {
          id: 'ach6',
          title: 'Creative Genius',
          description: 'Win art or music competition',
          category: 'ARTS' as AchievementCategory,
          tier: 'SILVER' as AchievementTier,
          icon: '🎨',
          points: 400,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Win art/music competition'],
        },
        {
          id: 'ach7',
          title: 'Helping Hand',
          description: 'Participate in 5 community service activities',
          category: 'PARTICIPATION' as AchievementCategory,
          tier: 'BRONZE' as AchievementTier,
          icon: '🤝',
          points: 250,
          isUnlocked: false,
          progress: 3,
          maxProgress: 5,
          requirements: ['5 community service activities'],
        },
        {
          id: 'ach8',
          title: 'Quiz Master',
          description: 'Score 100% in 5 quizzes',
          category: 'ACADEMIC' as AchievementCategory,
          tier: 'DIAMOND' as AchievementTier,
          icon: '💎',
          points: 1500,
          isUnlocked: false,
          progress: 2,
          maxProgress: 5,
          requirements: ['100% in 5 different quizzes'],
        },
      ] as Achievement[];
    },
  });

  // Mock leaderboard data
  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        { rank: 1, studentName: 'Priya Sharma', class: 'Class 10-A', totalPoints: 3450, achievements: 12, trend: 'same' as const },
        { rank: 2, studentName: 'Aarav Kumar', class: 'Class 10-A', totalPoints: 3200, achievements: 11, trend: 'up' as const },
        { rank: 3, studentName: 'Rahul Verma', class: 'Class 11-B', totalPoints: 2980, achievements: 10, trend: 'down' as const },
        { rank: 4, studentName: 'Ananya Singh', class: 'Class 9-C', totalPoints: 2750, achievements: 9, trend: 'up' as const },
        { rank: 5, studentName: 'Vivaan Gupta', class: 'Class 10-B', totalPoints: 2650, achievements: 9, trend: 'same' as const },
      ] as Leaderboard[];
    },
  });

  const filteredAchievements = achievementsData?.filter((ach) => {
    const matchesSearch = ach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ach.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || ach.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' ||
      (filterStatus === 'UNLOCKED' && ach.isUnlocked) ||
      (filterStatus === 'LOCKED' && !ach.isUnlocked);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: achievementsData?.length || 0,
    unlocked: achievementsData?.filter((a) => a.isUnlocked).length || 0,
    inProgress: achievementsData?.filter((a) => !a.isUnlocked && a.progress && a.progress > 0).length || 0,
    totalPoints: achievementsData?.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.points, 0) || 0,
  };

  const getTierColor = (tier: AchievementTier) => {
    const colors = {
      BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
      SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
      GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PLATINUM: 'bg-blue-100 text-blue-800 border-blue-300',
      DIAMOND: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[tier];
  };

  const getCategoryColor = (category: AchievementCategory) => {
    const colors = {
      ACADEMIC: 'bg-blue-100 text-blue-800',
      ATTENDANCE: 'bg-green-100 text-green-800',
      PARTICIPATION: 'bg-purple-100 text-purple-800',
      LEADERSHIP: 'bg-yellow-100 text-yellow-800',
      SPORTS: 'bg-red-100 text-red-800',
      ARTS: 'bg-pink-100 text-pink-800',
    };
    return colors[category];
  };


  return (
    <Can
      permission={PERMISSIONS.CONTENT_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view achievements</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Achievements & Badges</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your progress and unlock achievements
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🏆 My Achievements
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 Leaderboard
          </button>
        </div>

        {activeTab === 'achievements' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Achievements</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Unlocked</p>
                    <p className="text-3xl font-bold text-green-600">{stats.unlocked}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalPoints}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="ATTENDANCE">Attendance</option>
                    <option value="PARTICIPATION">Participation</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="SPORTS">Sports</option>
                    <option value="ARTS">Arts</option>
                  </Select>

                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="UNLOCKED">Unlocked</option>
                    <option value="LOCKED">Locked</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading achievements...</p>
              </div>
            ) : filteredAchievements && filteredAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`hover:shadow-lg transition-shadow border-2 ${
                      achievement.isUnlocked ? getTierColor(achievement.tier) : 'opacity-60'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-5xl">{achievement.icon}</div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                            {achievement.category}
                          </Badge>
                          <Badge className={getTierColor(achievement.tier)}>
                            {achievement.tier}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                      {achievement.maxProgress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all"
                              style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 mb-3">
                        {achievement.requirements.map((req, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {req}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <Badge variant="info" className="text-lg">
                          {achievement.points} pts
                        </Badge>
                        {achievement.isUnlocked && achievement.unlockedDate && (
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.unlockedDate).toLocaleDateString()}
                          </span>
                        )}
                        {!achievement.isUnlocked && (
                          <span className="text-xs text-gray-500">🔒 Locked</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No achievements found</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top Students by Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.rank <= 3 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {entry.rank}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{entry.studentName}</p>
                        <p className="text-sm text-gray-600">{entry.class}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{entry.totalPoints}</p>
                        <p className="text-xs text-gray-600">{entry.achievements} achievements</p>
                      </div>

                      <div className="w-8">
                        {entry.trend === 'up' && <span className="text-green-600 text-xl">↑</span>}
                        {entry.trend === 'down' && <span className="text-red-600 text-xl">↓</span>}
                        {entry.trend === 'same' && <span className="text-gray-400 text-xl">→</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Leaderboard Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Overall', 'Academic', 'Attendance', 'Sports', 'Arts', 'Monthly'].map((category) => (
                    <Button key={category} variant="outline" className="justify-start">
                      {category} →
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Can>
  );
}
