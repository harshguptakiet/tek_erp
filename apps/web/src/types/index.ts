// Common types used across the application

export type Role = 
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'HR_MANAGER'
  | 'CONTENT_CREATOR';

export type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Date range filter
export interface DateRange {
  from: Date | string;
  to: Date | string;
}

// Common filters
export interface BaseFilters extends PaginationParams {
  search?: string;
  status?: Status;
  dateRange?: DateRange;
}
