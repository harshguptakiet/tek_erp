/**
 * Certificate Generator Component
 * Generate certificates for students (awards, completion, participation, etc.)
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Award, FileText, Search, Plus } from 'lucide-react';

const certificateSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  type: z.string().min(1, 'Certificate type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  issuedDate: z.string().min(1, 'Issue date is required'),
  validUntil: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

const certificateTypes = [
  { value: 'ACHIEVEMENT', label: 'Achievement Award', icon: '🏆' },
  { value: 'PARTICIPATION', label: 'Participation', icon: '🎯' },
  { value: 'COMPLETION', label: 'Course Completion', icon: '✅' },
  { value: 'MERIT', label: 'Merit Certificate', icon: '⭐' },
  { value: 'ATTENDANCE', label: 'Perfect Attendance', icon: '📅' },
  { value: 'SPORTS', label: 'Sports Achievement', icon: '🏅' },
  { value: 'CONDUCT', label: 'Good Conduct', icon: '👍' },
  { value: 'CUSTOM', label: 'Custom Certificate', icon: '📜' },
];

export function CertificateGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  const [previewData, setPreviewData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      issuedDate: new Date().toISOString().split('T')[0],
    },
  });

  // Mock existing certificates
  const certificates = [
    {
      id: '1',
      studentName: 'Rahul Kumar',
      studentClass: 'Class 10-A',
      type: 'ACHIEVEMENT',
      title: 'Science Olympiad Winner',
      issuedDate: '2026-12-01',
      certificateNumber: 'CERT-2026-001',
    },
    {
      id: '2',
      studentName: 'Priya Sharma',
      studentClass: 'Class 12-B',
      type: 'MERIT',
      title: 'Academic Excellence',
      issuedDate: '2026-11-15',
      certificateNumber: 'CERT-2026-002',
    },
  ];

  const handleGenerate = (data: CertificateFormData) => {
    setPreviewData(data);
    // API call would go here
    console.log('Generating certificate:', data);
  };

  const handleDownload = (format: 'pdf' | 'png') => {
    console.log(`Downloading as ${format}`);
    // Download logic here
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">
            <Plus className="h-4 w-4 mr-2" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="existing">
            <FileText className="h-4 w-4 mr-2" />
            Existing Certificates
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student *</Label>
                    <Select
                      value={form.watch('studentId')}
                      onValueChange={(value) => form.setValue('studentId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S001">Rahul Kumar - Class 10-A</SelectItem>
                        <SelectItem value="S002">Priya Sharma - Class 12-B</SelectItem>
                        <SelectItem value="S003">Amit Singh - Class 9-C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Certificate Type *</Label>
                    <Select
                      value={form.watch('type')}
                      onValueChange={(value) => form.setValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Certificate Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Science Olympiad Winner"
                      {...form.register('title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Additional details..."
                      {...form.register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issuedDate">Issue Date *</Label>
                      <Input
                        id="issuedDate"
                        type="date"
                        {...form.register('issuedDate')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        {...form.register('validUntil')}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    Generate Preview
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Certificate Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewData ? (
                  <div className="space-y-4">
                    <div className="border-4 border-double border-yellow-600 p-8 bg-gradient-to-br from-yellow-50 to-white">
                      <div className="text-center space-y-4">
                        <Award className="h-16 w-16 mx-auto text-yellow-600" />
                        <h2 className="text-3xl font-bold text-gray-900">
                          Certificate of {certificateTypes.find(t => t.value === previewData.type)?.label}
                        </h2>
                        <p className="text-sm text-gray-600">This is to certify that</p>
                        <h3 className="text-2xl font-bold text-indigo-600">
                          [Student Name]
                        </h3>
                        <p className="text-sm text-gray-600">has been awarded for</p>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {previewData.title}
                        </h4>
                        {previewData.description && (
                          <p className="text-sm text-gray-600">{previewData.description}</p>
                        )}
                        <div className="pt-8 text-sm text-gray-600">
                          <p>Issued on: {new Date(previewData.issuedDate).toLocaleDateString()}</p>
                          {previewData.validUntil && (
                            <p>Valid until: {new Date(previewData.validUntil).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleDownload('pdf')} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button onClick={() => handleDownload('png')} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download PNG
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Award className="h-16 w-16 mx-auto mb-4" />
                      <p>Fill the form to preview certificate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Existing Certificates Tab */}
        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Certificates ({certificates.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cert.studentName}</p>
                        <p className="text-sm text-gray-600">{cert.studentClass}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{cert.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {certificateTypes.find(t => t.value === cert.type)?.label}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {new Date(cert.issuedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{cert.certificateNumber}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
