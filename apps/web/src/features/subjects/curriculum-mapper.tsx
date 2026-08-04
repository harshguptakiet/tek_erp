'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Chapter {
  id: string;
  name: string;
  description?: string;
  order: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  order: number;
}

interface CurriculumMapperProps {
  subjectId: string;
  subjectName: string;
  initialChapters?: Chapter[];
  onSave?: (chapters: Chapter[]) => void;
}

export function CurriculumMapper({
  subjectId,
  subjectName,
  initialChapters = [],
  onSave,
}: CurriculumMapperProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      name: 'New Chapter',
      order: chapters.length + 1,
      topics: [],
    };
    setChapters([...chapters, newChapter]);
    setEditingChapter(newChapter.id);
    setExpandedChapters(new Set([...expandedChapters, newChapter.id]));
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    setChapters(
      chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...updates } : ch))
    );
    setEditingChapter(null);
  };

  const deleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its topics?')) {
      setChapters(chapters.filter((ch) => ch.id !== chapterId));
      toast.success('Chapter deleted');
    }
  };

  const addTopic = (chapterId: string) => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: 'New Topic',
      order: chapters.find((ch) => ch.id === chapterId)?.topics.length || 0 + 1,
    };

    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? { ...ch, topics: [...ch.topics, newTopic] }
          : ch
      )
    );
    setEditingTopic(newTopic.id);
  };

  const updateTopic = (chapterId: string, topicId: string, updates: Partial<Topic>) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              topics: ch.topics.map((t) =>
                t.id === topicId ? { ...t, ...updates } : t
              ),
            }
          : ch
      )
    );
    setEditingTopic(null);
  };

  const deleteTopic = (chapterId: string, topicId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? { ...ch, topics: ch.topics.filter((t) => t.id !== topicId) }
          : ch
      )
    );
    toast.success('Topic deleted');
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === chapters.length - 1)
    ) {
      return;
    }

    const newChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newChapters[index], newChapters[targetIndex]] = [
      newChapters[targetIndex],
      newChapters[index],
    ];

    // Update order numbers
    newChapters.forEach((ch, i) => {
      ch.order = i + 1;
    });

    setChapters(newChapters);
  };

  const handleSave = () => {
    onSave?.(chapters);
    toast.success('Curriculum saved successfully');
  };

  const getTotalTopics = () => {
    return chapters.reduce((sum, ch) => sum + ch.topics.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{subjectName} - Curriculum</h2>
          <p className="text-muted-foreground">
            {chapters.length} chapters • {getTotalTopics()} topics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addChapter}>
            <Plus className="w-4 h-4 mr-2" />
            Add Chapter
          </Button>
          <Button onClick={handleSave}>Save Curriculum</Button>
        </div>
      </div>

      {/* Chapters */}
      {chapters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No chapters added yet</p>
            <Button onClick={addChapter}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Chapter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter, chapterIndex) => (
            <Card key={chapter.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="mt-1"
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      {editingChapter === chapter.id ? (
                        <div className="space-y-2">
                          <Input
                            value={chapter.name}
                            onChange={(e) =>
                              updateChapter(chapter.id, { name: e.target.value })
                            }
                            onBlur={() => setEditingChapter(null)}
                            autoFocus
                            className="font-semibold"
                          />
                          <Input
                            placeholder="Chapter description (optional)"
                            value={chapter.description || ''}
                            onChange={(e) =>
                              updateChapter(chapter.id, {
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              Chapter {chapter.order}: {chapter.name}
                            </CardTitle>
                            <Badge variant="secondary">
                              {chapter.topics.length} topics
                            </Badge>
                          </div>
                          {chapter.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveChapter(chapterIndex, 'up')}
                      disabled={chapterIndex === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveChapter(chapterIndex, 'down')}
                      disabled={chapterIndex === chapters.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingChapter(chapter.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChapter(chapter.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedChapters.has(chapter.id) && (
                <CardContent>
                  <div className="space-y-2 pl-8">
                    {chapter.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        {editingTopic === topic.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Input
                              value={topic.name}
                              onChange={(e) =>
                                updateTopic(chapter.id, topic.id, {
                                  name: e.target.value,
                                })
                              }
                              onBlur={() => setEditingTopic(null)}
                              autoFocus
                              placeholder="Topic name"
                            />
                            <Input
                              value={topic.description || ''}
                              onChange={(e) =>
                                updateTopic(chapter.id, topic.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Description (optional)"
                            />
                            <Input
                              value={topic.duration || ''}
                              onChange={(e) =>
                                updateTopic(chapter.id, topic.id, {
                                  duration: e.target.value,
                                })
                              }
                              placeholder="Duration (e.g., 2 hours)"
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{topic.name}</span>
                              {topic.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {topic.duration}
                                </Badge>
                              )}
                            </div>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTopic(topic.id)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTopic(chapter.id, topic.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTopic(chapter.id)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Topic
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
