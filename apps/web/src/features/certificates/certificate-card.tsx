'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

interface CertificateCardProps {
  certificate: {
    id: string;
    certificateNumber: string;
    type: 'ACHIEVEMENT' | 'COMPLETION' | 'PARTICIPATION' | 'MERIT';
    title: string;
    description?: string;
    issuedTo: {
      name: string;
      studentId?: string;
    };
    issuedDate: string;
    validUntil?: string;
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    issuer: {
      name: string;
      designation?: string;
    };
  };
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onView?: (id: string) => void;
  isDownloading?: boolean;
}

export function CertificateCard({
  certificate,
  onDownload,
  onShare,
  onView,
  isDownloading,
}: CertificateCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ACHIEVEMENT: 'bg-purple-100 text-purple-700 border-purple-200',
      COMPLETION: 'bg-blue-100 text-blue-700 border-blue-200',
      PARTICIPATION: 'bg-green-100 text-green-700 border-green-200',
      MERIT: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = () => {
    switch (certificate.status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'REVOKED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Revoked
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Expired
          </Badge>
        );
    }
  };

  const isExpired = certificate.validUntil
    ? new Date(certificate.validUntil) < new Date()
    : false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Decorative Header */}
      <div className={`h-2 ${getTypeColor(certificate.type).replace('text-', 'bg-').split(' ')[0]}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${getTypeColor(certificate.type)}`}>
            <Award className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getTypeColor(certificate.type)}>
                {certificate.type}
              </Badge>
              {getStatusBadge()}
            </div>
            <h3 className="text-lg font-semibold mb-1">{certificate.title}</h3>
            {certificate.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {certificate.description}
              </p>
            )}
          </div>
        </div>

        {/* Certificate Details */}
        <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Issued to:</span>
            <span className="font-medium">{certificate.issuedTo.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Certificate #:</span>
            <span className="font-mono text-xs">{certificate.certificateNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Issued on:</span>
            <span className="font-medium">
              {format(new Date(certificate.issuedDate), 'MMM dd, yyyy')}
            </span>
          </div>

          {certificate.validUntil && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Valid until:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                {format(new Date(certificate.validUntil), 'MMM dd, yyyy')}
              </span>
              {isExpired && (
                <Badge variant="destructive" className="ml-2">Expired</Badge>
              )}
            </div>
          )}

          <div className="pt-3 border-t">
            <p className="text-xs text-gray-600">
              Issued by <span className="font-medium">{certificate.issuer.name}</span>
              {certificate.issuer.designation && (
                <span>, {certificate.issuer.designation}</span>
              )}
            </p>
          </div>
        </div>

        {/* Warning for revoked/expired */}
        {(certificate.status === 'REVOKED' || certificate.status === 'EXPIRED') && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">
                {certificate.status === 'REVOKED'
                  ? 'This certificate has been revoked and is no longer valid'
                  : 'This certificate has expired'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(certificate.id)}
          >
            View Full
          </Button>
          {certificate.status === 'ACTIVE' && (
            <>
              <Button
                variant="default"
                onClick={() => onDownload?.(certificate.id)}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                variant="outline"
                onClick={() => onShare?.(certificate.id)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
