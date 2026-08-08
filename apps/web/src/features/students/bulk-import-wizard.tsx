'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/ui/file-uploader';
import { DataTable } from '@/components/ui/data-table';
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useBulkImportStudents } from './use-students';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

const steps = [
  { id: 1, name: 'Download Template' },
  { id: 2, name: 'Upload File' },
  { id: 3, name: 'Validate Data' },
  { id: 4, name: 'Import' },
];

export function BulkImportWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const bulkImport = useBulkImportStudents();

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth (YYYY-MM-DD)',
      'Gender',
      'Admission Number',
      'Class',
      'Section',
      'Father Name',
      'Mother Name',
      'Guardian Phone',
      'Address',
    ];

    const sampleData = [
      [
        'John',
        'Doe',
        'john.doe@example.com',
        '1234567890',
        '2010-01-15',
        'MALE',
        'STU001',
        '10',
        'A',
        'Robert Doe',
        'Jane Doe',
        '9876543210',
        '123 Main St',
      ],
    ];

    const csv = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      // Parse CSV and show preview
      const file = uploadedFiles[0];
      const text = await file.text();
      const rows = text.split('\n').filter(Boolean);
      const headers = rows[0].split(',');
      const data = rows.slice(1, 6).map((row, index) => {
        const values = row.split(',');
        return {
          rowNumber: index + 2,
          firstName: values[0],
          lastName: values[1],
          email: values[2],
          status: 'pending',
        };
      });
      setPreviewData(data);
    }
  };

  const handleImport = async () => {
    if (files.length === 0) return;

    try {
      const result = await bulkImport.mutateAsync(files[0]);
      setImportResult(result as any);
      setCurrentStep(4);

      if (result.failed === 0) {
        toast.success(`Successfully imported ${result.success} students`);
      } else {
        toast.warning(
          `Imported ${result.success} students, ${result.failed} failed`
        );
      }
    } catch (error) {
      toast.error('Failed to import students');
    }
  };

  const previewColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'rowNumber',
      header: 'Row',
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => (
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      ),
    },
  ];

  const errorColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'row',
      header: 'Row',
    },
    {
      accessorKey: 'field',
      header: 'Field',
    },
    {
      accessorKey: 'message',
      header: 'Error',
      cell: ({ row }) => (
        <span className="text-red-600">{row.original.message}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{step.name}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} />
      </Card>

      {/* Step 1: Download Template */}
      {currentStep === 1 && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">Download Import Template</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Download the CSV template, fill in student details, and upload it in the next step.
              Make sure to follow the format exactly.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={downloadTemplate} size="lg">
                <Download className="h-5 w-5 mr-2" />
                Download Template
              </Button>
            </div>
            <div className="mt-8">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                Skip to Upload
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Upload File */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>
          <FileUploader
            value={files}
            onChange={handleFileUpload}
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
            accept=".csv,.xlsx"
            showPreview={true}
          />
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Preview (First 5 rows)</h3>
              <DataTable
                columns={previewColumns}
                data={previewData}
                showPagination={false}
              />
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={files.length === 0}
            >
              Continue to Validate
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Validate */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Validate Data</h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Ready to Import</p>
                <p className="text-sm text-blue-700">
                  {previewData.length} rows detected. Click Import to proceed.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={bulkImport.isPending}>
              {bulkImport.isPending ? 'Importing...' : 'Import Students'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && importResult && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Import Results</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">Successfully Imported</p>
                  <p className="text-2xl font-bold text-green-900">
                    {importResult.success}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-700">Failed</p>
                  <p className="text-2xl font-bold text-red-900">
                    {importResult.failed}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {importResult.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Errors</h3>
              <DataTable
                columns={errorColumns}
                data={importResult.errors}
                showPagination={false}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => router.push('/students')}>
              Go to Students List
            </Button>
            <Button onClick={() => {
              setCurrentStep(1);
              setFiles([]);
              setPreviewData([]);
              setImportResult(null);
            }}>
              Import More Students
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
