/**
 * User Management Types
 * Based on Module 02: User Management Requirements
 */

import { AccountStatus } from './auth.types';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface ProfileCompleteness {
  percentage: number;
  missingFields: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  bloodGroup?: string;
  profilePicture?: string;
  bio?: string;
  address?: AddressInfo | string;
  role: string[];
  organizationId?: string;
  status: AccountStatus;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  lastLogin?: Date;
  profileCompleteness: ProfileCompleteness;
  privacySettings?: PrivacySettings;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  bloodGroup?: string;
  phone?: string;
  bio?: string;
  address?: AddressInfo;
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'ORGANIZATION' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showEmail: boolean;
  showPhone: boolean;
  allowSearchIndexing?: boolean;
  allowSearchEngineIndexing?: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean | 'EVERYONE' | 'CONNECTIONS' | 'NONE';
  dataSharing?: boolean;
  analyticsTracking?: boolean;
  allowAnalyticsTracking?: boolean;
  personalizedRecommendations?: boolean;
  allowMarketingEmails?: boolean;
  allowNotifications?: boolean;
}

export interface StudentProfile extends UserProfile {
  admissionNumber: string;
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  className?: string;
  sectionName?: string;
  class?: string;
  section?: string;
  academicYear?: string;
  admissionDate?: Date | string;
  bloodGroup?: string;
  parentIds: string[];
  parentPhone?: string;
  emergencyContact?: string;
  medicalConditions?: string[];
  isVerified?: boolean;
}

export interface StudentHealthRecord {
  studentId: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  medicalConditions: string[];
  chronicConditions?: string[];
  allergies: string[];
  medications: string[];
  vaccinations: VaccinationRecord[];
  emergencyContacts: EmergencyContact[];
  emergencyContactRelation?: string;
  doctorName?: string;
  doctorPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface VaccinationRecord {
  name: string;
  date: Date;
  nextDue?: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface TeacherProfile extends UserProfile {
  employeeId: string;
  designation: string;
  department?: string;
  joiningDate: Date;
  qualifications: Qualification[];
  subjectExpertise: SubjectExpertise[];
  experience: number;
  experienceYears?: number;
  subjects?: string[];
  isVerified?: boolean;
  employmentType?: string;
  highestQualification?: string;
  specialization?: string;
  salary?: number;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  specialization?: string;
  certificateUrl?: string;
  verified: boolean;
}

export interface SubjectExpertise {
  subjectId: string;
  subjectName: string;
  proficiency: 'EXPERT' | 'PROFICIENT' | 'LEARNING';
  isPrimary: boolean;
  gradeLevels: string[];
}

export interface ParentProfile extends UserProfile {
  occupation?: string;
  employer?: string;
  children: ChildInfo[];
  preferredCommunication: 'EMAIL' | 'SMS' | 'PHONE' | 'APP';
}

export interface ChildInfo {
  studentId: string;
  name: string;
  className: string;
  relationship: string;
  isPrimary: boolean;
}

export interface PublisherProfile extends UserProfile {
  companyName: string;
  legalName: string;
  registrationNumber: string;
  taxId: string;
  website?: string;
  verified: boolean;
  verificationDate?: Date;
}

export interface CreatorProfile extends UserProfile {
  creatorType: 'INDIVIDUAL' | 'TEAM';
  expertise: string[];
  portfolio?: string;
  verified: boolean;
}

export interface BulkImportRequest {
  file: File;
  roleType: string;
  organizationId?: string;
}

export interface BulkImportResult {
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: BulkImportError[];
}

export interface BulkImportError {
  row: number;
  field: string;
  error: string;
  value: any;
}
