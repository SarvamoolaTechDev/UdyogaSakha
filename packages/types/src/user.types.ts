import { AccountStatus, ParticipantType, TrustLevel, UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  phone?: string;
  roles: UserRole[];
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  participantType: ParticipantType;
  // Organization-specific
  organizationName?: string;
  organizationRegNo?: string;
  // Visibility preferences
  showContactAfterMatch: boolean;
}

export interface TrustSummary {
  userId: string;
  currentLevel: TrustLevel;
  badges: TrustBadge[];
  reputationScore: number;
  completedEngagements: number;
}

export interface TrustBadge {
  id: string;
  userId: string;
  badgeType: string;
  grantedAt: Date;
  grantedBy: string;
  validUntil?: Date;
  status: import('./enums').TrustBadgeStatus;
}

export interface UserDocument {
  id: string;
  userId: string;
  docType: DocumentType;
  storageKey: string;   // s3/r2 object key — never a public URL
  uploadedAt: Date;
  verifiedAt?: Date;
  verifierId?: string;
}

export enum DocumentType {
  AADHAR        = 'aadhar',
  PAN           = 'pan',
  GST_CERT      = 'gst_cert',
  COMPANY_REG   = 'company_reg',
  PROFESSIONAL_CERT = 'professional_cert',
  OTHER         = 'other',
}

// Auth DTOs
export interface RegisterDto {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  participantType: ParticipantType;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
