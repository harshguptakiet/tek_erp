/**
 * API Error Mapper
 * Maps Axios errors to consistent AppError format
 */

import type { AxiosError } from 'axios';

export interface AppError {
  message: string;
  title: string;
  code: string;
  statusCode: number;
  details?: any;
}

export function errorMapper(error: AxiosError): AppError {
  // API response error
  if (error.response) {
    const data = error.response.data as any;
    const status = error.response.status;
    
    // Default error titles based on status code
    const defaultTitle = 
      status >= 500 ? 'Server Error' :
      status === 404 ? 'Not Found' :
      status === 403 ? 'Access Denied' :
      status === 401 ? 'Unauthorized' :
      'Error';
    
    return {
      title: data.error || defaultTitle,
      message: data.message || 'An error occurred',
      code: data.code || data.statusCode?.toString() || 'UNKNOWN_ERROR',
      statusCode: status,
      details: data.details || data,
    };
  }

  // Network error
  if (error.request) {
    return {
      title: 'Network Error',
      message: 'Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    };
  }

  // Something else
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 0,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
