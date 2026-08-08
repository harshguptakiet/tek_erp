'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Copy, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  mandatory: boolean;
  category: string;
}

interface FeeStructureBuilderProps {
  classId?: string;
  academicYearId?: string;
  initialStructure?: {
    name: string;
    components: FeeComponent[];
  };
  onSave?: (structure: any) => void;
}

export function FeeStructureBuilder({
  classId,
  academicYearId,
  initialStructure,
  onSave,
}: FeeStructureBuilderProps) {
  const [structureName, setStructureName] = useState(initialStructure?.name || '');
  const [components, setComponents] = useState<FeeComponent[]>(
    initialStructure?.components || []
  );
  const [applicableClasses, setApplicableClasses] = useState<string[]>([]);

  const categories = [
    'Tuition',
    'Laboratory',
    'Library',
    'Sports',
    'Transport',
    'Hostel',
    'Examination',
    'Development',
    'Other',
  ];

  const frequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'one-time', label: 'One-time' },
  ];

  const addComponent = () => {
    const newComponent: FeeComponent = {
      id: `component-${Date.now()}`,
      name: '',
      amount: 0,
      frequency: 'annually',
      mandatory: true,
      category: 'Tuition',
    };
    setComponents([...components, newComponent]);
  };

  const duplicateComponent = (index: number) => {
    const original = components[index];
    const duplicate: FeeComponent = {
      ...original,
      id: `component-${Date.now()}`,
      name: `${original.name} (Copy)`,
    };
    setComponents([...components, duplicate]);
    toast.success('Component duplicated');
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_comp: FeeComponent, i: number) => i !== index));
    toast.success('Component removed');
  };

  const updateComponent = (index: number, updates: Partial<FeeComponent>) => {
    setComponents(
      components.map((comp: FeeComponent, i: number) => (i === index ? { ...comp, ...updates } : comp))
    );
  };

  const calculateTotals = () => {
    const totals = {
      monthly: 0,
      quarterly: 0,
      annually: 0,
      oneTime: 0,
    };

    components.forEach((comp: FeeComponent) => {
      if (comp.frequency === 'monthly') totals.monthly += comp.amount;
      else if (comp.frequency === 'quarterly') totals.quarterly += comp.amount;
      else if (comp.frequency === 'annually') totals.annually += comp.amount;
      else if (comp.frequency === 'one-time') totals.oneTime += comp.amount;
    });

    const annualTotal =
      totals.annually +
      totals.monthly * 12 +
      totals.quarterly * 4 +
      totals.oneTime;

    return { ...totals, annualTotal };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (!structureName.trim()) {
      toast.error('Please enter a structure name');
      return;
    }

    if (components.length === 0) {
      toast.error('Please add at least one fee component');
      return;
    }

    const invalidComponents = components.filter(
      (c: FeeComponent) => !c.name.trim() || c.amount <= 0
    );

    if (invalidComponents.length > 0) {
      toast.error('Please fill in all component details');
      return;
    }

    onSave?.({
      name: structureName,
      components,
      applicableClasses,
      totals,
    });

    toast.success('Fee structure saved successfully');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Tuition: 'bg-blue-100 text-blue-800',
      Laboratory: 'bg-purple-100 text-purple-800',
      Library: 'bg-green-100 text-green-800',
      Sports: 'bg-orange-100 text-orange-800',
      Transport: 'bg-yellow-100 text-yellow-800',
      Hostel: 'bg-pink-100 text-pink-800',
      Examination: 'bg-red-100 text-red-800',
      Development: 'bg-indigo-100 text-indigo-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Structure Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Class 10 - Academic Year 2024-25"
              value={structureName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStructureName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Applicable Classes (Optional)
            </label>
            <Input placeholder="Select classes this structure applies to..." />
          </div>
        </CardContent>
      </Card>

      {/* Fee Components */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fee Components</CardTitle>
            <Button onClick={addComponent}>
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No fee components added yet</p>
              <Button onClick={addComponent} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Component
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((component: FeeComponent, index: number) => (
                <Card key={component.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Component Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Component #{index + 1}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateComponent(index)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Component Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Component Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="e.g., Tuition Fee"
                            value={component.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateComponent(index, { name: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Amount (₹) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={component.amount || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateComponent(index, {
                                amount: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Category
                          </label>
                          <select
                            value={component.category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              updateComponent(index, { category: e.target.value })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Frequency
                          </label>
                          <select
                            value={component.frequency}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              updateComponent(index, {
                                frequency: e.target.value as any,
                              })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {frequencies.map((freq) => (
                              <option key={freq.value} value={freq.value}>
                                {freq.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Component Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={component.mandatory}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateComponent(index, { mandatory: e.target.checked })
                            }
                          />
                          <label className="text-sm">Mandatory</label>
                        </div>
                        <Badge className={getCategoryColor(component.category)}>
                          {component.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {components.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {totals.monthly > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly</p>
                  <p className="text-2xl font-bold">₹{totals.monthly.toLocaleString()}</p>
                </div>
              )}
              {totals.quarterly > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Quarterly</p>
                  <p className="text-2xl font-bold">₹{totals.quarterly.toLocaleString()}</p>
                </div>
              )}
              {totals.annually > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Annually</p>
                  <p className="text-2xl font-bold">₹{totals.annually.toLocaleString()}</p>
                </div>
              )}
              {totals.oneTime > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">One-time</p>
                  <p className="text-2xl font-bold">₹{totals.oneTime.toLocaleString()}</p>
                </div>
              )}
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Annual</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{totals.annualTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Breakdown by Category */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Breakdown by Category:</p>
              {categories.map((category: string) => {
                const categoryTotal = components
                  .filter((c: FeeComponent) => c.category === category)
                  .reduce((sum: number, c: FeeComponent) => sum + c.amount, 0);

                if (categoryTotal === 0) return null;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <Badge className={getCategoryColor(category)}>{category}</Badge>
                    <span className="font-medium">₹{categoryTotal.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Warning */}
            {components.some((c: FeeComponent) => !c.mandatory) && (
              <div className="mt-6 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Optional Components Included</p>
                  <p className="mt-1">
                    Some fee components are marked as optional. Students may choose not to
                    pay these fees.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Fee Structure</Button>
      </div>
    </div>
  );
}
