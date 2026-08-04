'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Download, FileText, Image as ImageIcon } from 'lucide-react';

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: Array<{
    id: string;
    name: string;
    points: number;
    description: string;
  }>;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  files: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  text?: string;
}

interface GradingRubricProps {
  assignmentId: string;
  assignmentTitle: string;
  totalPoints: number;
  rubric: RubricCriterion[];
  submission: Submission;
  onSave?: (grade: {
    criterionScores: Record<string, number>;
    totalScore: number;
    feedback: string;
  }) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalSubmissions?: number;
}

export function GradingRubric({
  assignmentId,
  assignmentTitle,
  totalPoints,
  rubric,
  submission,
  onSave,
  onNext,
  onPrevious,
  currentIndex = 1,
  totalSubmissions = 1,
}: GradingRubricProps) {
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  const selectLevel = (criterionId: string, points: number) => {
    setCriterionScores({
      ...criterionScores,
      [criterionId]: points,
    });
  };

  const getTotalScore = () => {
    return Object.values(criterionScores).reduce((sum, score) => sum + score, 0);
  };

  const getPercentage = () => {
    return ((getTotalScore() / totalPoints) * 100).toFixed(1);
  };

  const getGrade = () => {
    const percentage = parseFloat(getPercentage());
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const handleSave = () => {
    onSave?.({
      criterionScores,
      totalScore: getTotalScore(),
      feedback,
    });
  };

  const feedbackTemplates = [
    'Excellent work! Well done.',
    'Good effort. Keep it up!',
    'Needs improvement. Please review the feedback.',
    'Great understanding of the concept.',
    'Please resubmit after addressing the comments.',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assignmentTitle}</h2>
          <p className="text-muted-foreground">
            Grading submission {currentIndex} of {totalSubmissions}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrevious} disabled={currentIndex === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={onNext} disabled={currentIndex === totalSubmissions}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{submission.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    Roll Number: {submission.rollNumber}
                  </p>
                </div>
                <Badge variant="secondary">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </Badge>
              </div>

              {/* Submitted Files */}
              {submission.files.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Attachments:</p>
                  <div className="space-y-2">
                    {submission.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {file.type.includes('image') ? (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Text */}
              {submission.text && (
                <div>
                  <p className="text-sm font-medium mb-2">Response:</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{submission.text}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rubric Grading */}
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {rubric.map((criterion) => (
                <div key={criterion.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{criterion.name}</h4>
                      <p className="text-sm text-muted-foreground">{criterion.description}</p>
                    </div>
                    <Badge variant="outline">Max: {criterion.maxPoints} pts</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {criterion.levels.map((level) => {
                      const isSelected = criterionScores[criterion.id] === level.points;
                      return (
                        <button
                          key={level.id}
                          onClick={() => selectLevel(criterion.id, level.points)}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{level.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{level.points} pts</span>
                              {isSelected ? (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Quick Templates:</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedback(feedback + (feedback ? '\n\n' : '') + template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Write detailed feedback for the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Score Summary */}
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Score Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Total Score */}
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {getTotalScore()}
                  <span className="text-2xl text-muted-foreground">/{totalPoints}</span>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  Grade: {getGrade()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{getPercentage()}%</p>
              </div>

              {/* Progress Bar */}
              <div>
                <Progress value={parseFloat(getPercentage())} className="h-3" />
              </div>

              {/* Criterion Breakdown */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Criterion Breakdown:</p>
                {rubric.map((criterion) => (
                  <div key={criterion.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1">
                      {criterion.name}
                    </span>
                    <span className="font-medium ml-2">
                      {criterionScores[criterion.id] || 0}/{criterion.maxPoints}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button className="w-full" onClick={handleSave} disabled={getTotalScore() === 0}>
                  Save Grade
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grading Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                <div className="text-2xl font-bold">
                  {currentIndex}/{totalSubmissions}
                </div>
                <Progress
                  value={(currentIndex / totalSubmissions) * 100}
                  className="h-2 mt-3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
