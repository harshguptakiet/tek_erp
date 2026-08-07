'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

interface Question {
  id: string;
  text: string;
  maxMarks: number;
  type: 'OBJECTIVE' | 'SUBJECTIVE';
}

interface GradingInterfaceProps {
  examId: string;
  questions: Question[];
  submissions: StudentSubmission[];
  onSave: (grades: any[]) => void;
}

export function GradingInterface({
  examId,
  questions,
  submissions,
  onSave,
}: GradingInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const currentSubmission = submissions[currentIndex];
  const totalMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0);

  const getStudentTotal = (submissionId: string) => {
    const studentGrades = grades[submissionId] || {};
    return Object.values(studentGrades).reduce((sum, mark) => sum + mark, 0);
  };

  const setQuestionGrade = (questionId: string, marks: number) => {
    setGrades((prev) => ({
      ...prev,
      [currentSubmission.id]: {
        ...(prev[currentSubmission.id] || {}),
        [questionId]: Math.max(
          0,
          Math.min(
            marks,
            questions.find((q) => q.id === questionId)?.maxMarks || 0
          )
        ),
      },
    }));
  };

  const goToNext = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = () => {
    const gradesData = submissions.map((submission) => ({
      submissionId: submission.id,
      studentId: submission.studentId,
      grades: questions.map((question) => ({
        questionId: question.id,
        marksObtained: grades[submission.id]?.[question.id] || 0,
      })),
      totalMarks: getStudentTotal(submission.id),
      feedback: feedback[submission.id] || '',
    }));
    onSave(gradesData);
  };

  const gradedCount = Object.keys(grades).length;
  const progressPercentage = (gradedCount / submissions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Grading Progress</span>
              <span className="text-gray-600">
                {gradedCount} of {submissions.length} students graded
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardContent>
      </Card>

      {/* Student Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentSubmission.studentName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Roll No: {currentSubmission.rollNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {getStudentTotal(currentSubmission.id)} / {totalMarks}
              </p>
              <p className="text-sm text-gray-600">Total Marks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Student {currentIndex + 1} of {submissions.length}
            </span>
            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentIndex === submissions.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions & Grading */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const answer = currentSubmission.answers.find(
            (a) => a.questionId === question.id
          );
          const marks = grades[currentSubmission.id]?.[question.id] || 0;

          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>Question {qIndex + 1}</Badge>
                      <Badge variant="secondary">{question.type}</Badge>
                    </div>
                    <p className="text-gray-900 font-medium">{question.text}</p>
                  </div>
                  <Badge variant="info">Max: {question.maxMarks}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Student Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Answer:
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {answer?.answer || 'No answer provided'}
                    </p>
                  </div>
                </div>

                {/* Marks Input */}
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks Obtained
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={question.maxMarks}
                      value={marks}
                      onChange={(e) =>
                        setQuestionGrade(
                          question.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuestionGrade(question.id, 0)}
                    >
                      0
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setQuestionGrade(
                          question.id,
                          question.maxMarks / 2
                        )
                      }
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setQuestionGrade(question.id, question.maxMarks)
                      }
                    >
                      Full
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={feedback[currentSubmission.id] || ''}
            onChange={(e) =>
              setFeedback((prev) => ({
                ...prev,
                [currentSubmission.id]: e.target.value,
              }))
            }
            placeholder="Add feedback for this student..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save & Publish Grades
        </Button>
      </div>
    </div>
  );
}
