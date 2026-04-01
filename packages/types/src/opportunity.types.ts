import {
  ApplicationStatus,
  EngagementStatus,
  ModuleType,
  OpportunityStatus,
  TrustLevel,
} from './enums';

// ─── Core Opportunity ────────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  requesterId: string;
  moduleType: ModuleType;
  title: string;
  description: string;
  trustLevelRequired: TrustLevel;
  status: OpportunityStatus;
  isPublic: boolean;           // false = visible only to verified members
  publishedAt?: Date;
  closesAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Module-specific extra fields stored as JSON
  details: OpportunityDetails;
}

// Module-specific detail payloads — extend as needed per module
export type OpportunityDetails =
  | EmploymentDetails
  | ServiceEngagementDetails
  | ProjectTenderDetails
  | ConsultancyDetails
  | TrainingDetails
  | StartupDetails
  | VendorDetails
  | AgencyDetails
  | VolunteerDetails;

export interface EmploymentDetails {
  moduleType: ModuleType.EMPLOYMENT_EXCHANGE;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'advisory' | 'fractional';
  industry: string;
  location: string;
  isRemote: boolean;
  compensationRange?: { min: number; max: number; currency: string };
  requiredSkills: string[];
  experienceYears?: number;
}

export interface ServiceEngagementDetails {
  moduleType: ModuleType.SERVICE_ENGAGEMENT;
  serviceCategory: string;   // e.g. 'pujari', 'vadika_chef', 'event_coordinator'
  engagementDate?: Date;
  duration?: string;         // e.g. '3 hours', '1 day'
  location: string;
  specialRequirements?: string;
  requiresEnhancedTrustVerification: boolean;
}

export interface ProjectTenderDetails {
  moduleType: ModuleType.PROJECT_TENDER;
  projectType: 'announcement' | 'rfp' | 'tender' | 'bid';
  budget?: { min: number; max: number; currency: string };
  timeline?: string;
  deliverables: string[];
  submissionDeadline?: Date;
}

export interface ConsultancyDetails {
  moduleType: ModuleType.CONSULTANCY_ADVISORY;
  domain: string;
  engagementModel: 'one_time' | 'retainer' | 'part_time';
  duration?: string;
}

export interface TrainingDetails {
  moduleType: ModuleType.TRAINING_SKILL_DEV;
  courseTitle: string;
  mode: 'online' | 'offline' | 'hybrid';
  duration: string;
  seats?: number;
  certificationOffered: boolean;
}

export interface StartupDetails {
  moduleType: ModuleType.STARTUP_INNOVATION;
  initiativeType: 'idea' | 'techathon' | 'cofounder_search' | 'mentor_connect' | 'collaboration';
  domain: string;
  stage?: 'ideation' | 'mvp' | 'growth';
}

export interface VendorDetails {
  moduleType: ModuleType.VENDOR_MARKETPLACE;
  vendorCategory: string;
  productOrServiceName: string;
  enquiryBased: boolean;  // Phase 1: enquiry only, no direct purchase
}

export interface AgencyDetails {
  moduleType: ModuleType.AGENCY_STAFF_AUG;
  staffingType: 'contract' | 'project_based' | 'event' | 'institutional';
  headcount?: number;
  duration?: string;
  domain: string;
}

export interface VolunteerDetails {
  moduleType: ModuleType.VOLUNTEER_SOCIAL;
  initiativeTitle: string;
  cause: string;
  commitmentHours?: number;
  location: string;
  isSkillBased: boolean;
}

// ─── Application & Engagement ────────────────────────────────────────────────

export interface Application {
  id: string;
  opportunityId: string;
  providerId: string;
  coverMessage?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewNote?: string;
}

export interface Engagement {
  id: string;
  opportunityId: string;
  requesterId: string;
  providerId: string;
  status: EngagementStatus;
  startedAt: Date;
  closedAt?: Date;
  closureNote?: string;
  completionAcknowledgedAt?: Date;
}

export interface EngagementFeedback {
  engagementId: string;
  byUserId: string;
  forUserId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: Date;
}

// ─── List / Search DTOs ──────────────────────────────────────────────────────

export interface OpportunityFilters {
  moduleType?: ModuleType;
  status?: OpportunityStatus;
  trustLevelRequired?: TrustLevel;
  requesterId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
