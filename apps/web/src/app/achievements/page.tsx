/**
 * Module 37: Gamification - Achievements & Badges
 * FR-ACHIEVE-001: Track and display student achievements
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';

export default function AchievementsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterUnlocked, setFilterUnlocked] = useState('');

  // Real API integration
  const { data: achievementsResponse, isLoading } = useQuery({
    queryKey: ['achievements', user?.id, selectedCategory],
    queryFn: () =>
      analyticsService.getStudentAchievements(user?.schoolId || '', user?.id || ''),
    enabled: !!user?.schoolId && !!user?.id,
  });

  // Transform API data
  const achievements = Array.isArray(achievementsResponse)
    ? achievementsResponse
    : achievementsResponse?.achievements || [];

  const filteredAchievements = achievements.filter((achievement: any) => {
    const matchesSearch =
      achievement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || achievement.category === selectedCategory;
    const matchesUnlocked =
      !filterUnlocked ||
      (filterUnlocked === 'unlocked' ? achievement.unlocked : !achievement.unlocked);
    return matchesSearch && matchesCategory && matchesUnlocked;
  });

  const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a: any) => a.unlocked)
    .reduce((sum: number, a: any) => sum + (a.points || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Achievements & Badges</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your progress and unlock achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <CardContent className="pt-6">
            <p className="text-yellow-100 text-sm">Total Points</p>
            <p className="text-4xl font-bold">{totalPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Unlocked</p>
            <p className="text-3xl font-bold text-green-600">{unlockedCount}</p>
            <p className="text-xs text-gray-500">of {achievements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {achievements.length > 0
                ? Math.round((unlockedCount / achievements.length) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Rank</p>
            <p className="text-3xl font-bold text-purple-600">
              #{user?.rank || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {unlockedCount} / {achievements.length} Unlocked
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              style={{
                width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0
                  }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="academic">Academic Excellence</option>
              <option value="attendance">Perfect Attendance</option>
              <option value="participation">Active Participation</option>
              <option value="leadership">Leadership</option>
              <option value="sports">Sports & Fitness</option>
              <option value="creative">Creative Arts</option>
            </Select>
            <Select value={filterUnlocked} onChange={(e) => setFilterUnlocked(e.target.value)}>
              <option value="">All Achievements</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading achievements...</p>
        </div>
      ) : filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement: any) => (
            <Card
              key={achievement.id}
              className={`hover:shadow-lg transition-all ${achievement.unlocked ? 'border-yellow-300' : 'opacity-60'
                }`}
            >
              <CardContent className="pt-6 text-center">
                {/* Badge Icon */}
                <div
                  className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gray-200'
                    }`}
                >
                  <span className="text-4xl">
                    {achievement.icon || (achievement.unlocked ? '🏆' : '🔒')}
                  </span>
                </div>

                {/* Title & Category */}
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {achievement.title || 'Achievement'}
                </h3>
                <Badge variant="secondary" className="mb-3">
                  {achievement.category || 'General'}
                </Badge>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {achievement.description || 'No description'}
                </p>

                {/* Points & Status */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{achievement.points || 0} pts</span>
                  </div>
                  {achievement.unlocked ? (
                    <Badge variant="success">Unlocked!</Badge>
                  ) : (
                    <Badge variant="secondary">Locked</Badge>
                  )}
                </div>

                {/* Unlock Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}

                {/* Progress Bar for Partial Achievements */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium">{achievement.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏆</span>
              <p className="text-gray-600">No achievements found</p>
              <p className="text-sm text-gray-500 mt-2">
                Keep working hard to unlock achievements!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Link */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Check Your Ranking
              </h3>
              <p className="text-gray-600">
                See how you compare with other students on the leaderboard
              </p>
            </div>
            <Button onClick={() => router.push('/leaderboard')}>
              View Leaderboard →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
