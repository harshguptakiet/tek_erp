'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQuestion, useUpdateQuestion } from '../exams/use-exams';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const questionSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'FILL_BLANK']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  questionText: z.string().min(1, 'Question text is required'),
  marks: z.number().min(1, 'Marks must be at least 1'),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  initialData?: Partial<QuestionFormData> & { id?: string };
  subjects?: Array<{ id: string; name: string }>;
}

export function QuestionForm({ initialData, subjects = [] }: QuestionFormProps) {
  const router = useRouter();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const [options, setOptions] = useState<string[]>(initialData?.type === 'MCQ' ? ['', '', '', ''] : []);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData,
  });

  const questionType = watch('type');

  const onSubmit = async (data: QuestionFormData) => {
    const submitData = {
      ...data,
      options: questionType === 'MCQ' ? options.map((text, idx) => ({ text, isCorrect: idx === correctAnswer })) : undefined,
      correctAnswer: questionType === 'TRUE_FALSE' ? correctAnswer : undefined,
    };

    if (initialData?.id) {
      await updateQuestion.mutateAsync({ id: initialData.id, data: submitData });
    } else {
      await createQuestion.mutateAsync(submitData);
    }
    router.back();
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Question Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Select onValueChange={(value) => setValue('subjectId', value)} defaultValue={initialData?.subjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-sm text-red-500">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <Select onValueChange={(value: any) => setValue('type', value)} defaultValue={initialData?.type || 'MCQ'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                  <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty *</label>
              <Select onValueChange={(value: any) => setValue('difficulty', value)} defaultValue={initialData?.difficulty || 'MEDIUM'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Marks *</label>
              <Input {...register('marks', { valueAsNumber: true })} type="number" min="1" />
              {errors.marks && <p className="text-sm text-red-500">{errors.marks.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text *</label>
            <Textarea {...register('questionText')} rows={4} placeholder="Enter question text..." />
            {errors.questionText && <p className="text-sm text-red-500">{errors.questionText.message}</p>}
          </div>

          {questionType === 'MCQ' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setCorrectAnswer(index)} className={correctAnswer === index ? 'bg-green-100' : ''}>
                    ✓
                  </Button>
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Explanation</label>
            <Textarea {...register('explanation')} rows={3} placeholder="Optional explanation..." />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">{initialData?.id ? 'Update' : 'Create'} Question</Button>
      </div>
    </form>
  );
}
