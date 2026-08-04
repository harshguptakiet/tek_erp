/**
 * Module 02: User Management - Bulk Student Operations
 * FR-USER-050: Bulk import, update, and manage students
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { 
  Loader2, 
  Upload, 
  Download, 
  FileText, 
  Users, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function BulkStudentOperationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState('');

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (file: File) => studentService.bulkImport(file),
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Imported ${data.success} students successfully`);
    },
    onError: () => {
      toast.error('Failed to import students');
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ studentIds, updates }: { studentIds: string[]; updates: any }) =>
      studentService.bulkUpdate(studentIds, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Updated ${data.updated} students successfully`);
    },
    onError: () => {
      toast.error('Failed to update students');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    // Create sample CSV template
    const headers = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'class',
      'section',
      'admissionNumber',
      'rollNumber',
      'bloodGroup',
      'address',
      'parentName',
      'parentPhone',
      'parentEmail'
    ].join(',');

    const sampleRow = [
      'John',
      'Doe',
      'john.doe@example.com',
      '+919876543210',
      '2010-05-15',
      'MALE',
      'Class 10',
      'A',
      'ADM2024001',
      '101',
      'O+',
      '123 Main St, Mumbai',
      'Jane Doe',
      '+919876543211',
      'jane.doe@example.com'
    ].join(',');

    const csv = `${headers}\n${sampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded');
  };

  return (
    <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push('/students')}>
            ← Back to Students
          </Button>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
            <p className="mt-2 text-sm text-gray-600">
              Import, update, and manage multiple students at once
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import Students</TabsTrigger>
            <TabsTrigger value="update">Bulk Update</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Students from File</CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file with student data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Download Template */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Download Template
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 ml-10">
                    Download our CSV template with the correct format and field headers
                  </p>
                  <div className="ml-10">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Template
                    </Button>
                  </div>
                </div>

                <div className="ml-10 border-l-2 border-gray-200 h-8"></div>

                {/* Step 2: Fill Template */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Fill in Student Data
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 ml-10">
                    Open the template in Excel or Google Sheets and fill in student information
                  </p>
                  <div className="ml-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Required Fields:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                      <div>• First Name</div>
                      <div>• Email (must be unique)</div>
                      <div>• Last Name</div>
                      <div>• Class</div>
                      <div>• Date of Birth</div>
                      <div>• Section</div>
                      <div>• Gender</div>
                      <div>• Admission Number</div>
                    </div>
                  </div>
                </div>

                <div className="ml-10 border-l-2 border-gray-200 h-8"></div>

                {/* Step 3: Upload File */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Upload File
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 ml-10">
                    Upload your completed file to import students
                  </p>
                  <div className="ml-10">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      {selectedFile ? (
                        <div>
                          <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                          <p className="font-medium text-gray-900 mb-2">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500 mb-4">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={handleImport}
                              disabled={importMutation.isPending}
                            >
                              {importMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Import Students
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedFile(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="font-medium text-gray-900 mb-2">
                            Drop your file here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supported formats: CSV, XLSX (Max 10MB)
                          </p>
                          <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload">
                            <Button variant="outline" as="span">
                              Select File
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Import Results */}
                {importResults && (
                  <>
                    <div className="ml-10 border-l-2 border-gray-200 h-8"></div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        Import Results
                      </h3>
                      <div className="ml-10 space-y-3">
                        <Card className="border-green-200 bg-green-50">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-green-900 font-medium">Successfully Imported</span>
                              <Badge variant="success">{importResults.success}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        {importResults.failed > 0 && (
                          <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-red-900 font-medium">Failed</span>
                                <Badge variant="error">{importResults.failed}</Badge>
                              </div>
                              <details className="mt-3">
                                <summary className="cursor-pointer text-sm text-red-800 font-medium">
                                  View Errors
                                </summary>
                                <div className="mt-2 space-y-1">
                                  {importResults.errors?.map((error: any, idx: number) => (
                                    <p key={idx} className="text-xs text-red-700">
                                      Row {error.row}: {error.message}
                                    </p>
                                  ))}
                                </div>
                              </details>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Update Tab */}
          <TabsContent value="update">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Update Students</CardTitle>
                <CardDescription>
                  Update multiple students at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Action
                  </label>
                  <Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                    <option value="">Choose an action...</option>
                    <option value="update_class">Move to Different Class</option>
                    <option value="update_section">Change Section</option>
                    <option value="update_status">Update Status</option>
                    <option value="promote">Promote to Next Class</option>
                  </Select>
                </div>

                {bulkAction && (
                  <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-3 mb-4">
                      <Edit className="h-6 w-6 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Select Students</p>
                        <p className="text-sm text-gray-600">
                          Go to the students list to select students for bulk operations
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => router.push('/students')}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Go to Students List
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Student Data</CardTitle>
                <CardDescription>
                  Download student information in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <FileText className="h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Export to CSV</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download all student data in CSV format for Excel or Google Sheets
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-green-300 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <FileText className="h-12 w-12 text-green-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Export to Excel</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download formatted Excel file with all student information
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <FileText className="h-12 w-12 text-purple-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Export to PDF</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate PDF report with student list and details
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-yellow-300 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <Users className="h-12 w-12 text-yellow-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Custom Export</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select specific fields and filters for custom export
                      </p>
                      <Button variant="outline" className="w-full">
                        Configure Export
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Can>
  );
}
