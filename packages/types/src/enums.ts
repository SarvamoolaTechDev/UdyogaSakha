// ─── Trust Framework ────────────────────────────────────────────────────────

export enum TrustLevel {
  L0_REGISTERED = 0,
  L1_DOCUMENT_VERIFIED = 1,
  L2_FOUNDATION_SCREENED = 2,
  L3_DOMAIN_EXPERT_CERTIFIED = 3,
  L4_COMMUNITY_ENDORSED = 4,
}

export enum TrustBadgeStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  UNDER_REVIEW = 'under_review',
}

// ─── Opportunity Modules ─────────────────────────────────────────────────────

export enum ModuleType {
  EMPLOYMENT_EXCHANGE     = 'employment_exchange',
  AGENCY_STAFF_AUG        = 'agency_staff_aug',
  PROJECT_TENDER          = 'project_tender',
  CONSULTANCY_ADVISORY    = 'consultancy_advisory',
  SERVICE_ENGAGEMENT      = 'service_engagement',
  VENDOR_MARKETPLACE      = 'vendor_marketplace',
  TRAINING_SKILL_DEV      = 'training_skill_dev',
  STARTUP_INNOVATION      = 'startup_innovation',
  VOLUNTEER_SOCIAL        = 'volunteer_social',
}

// ─── Opportunity Lifecycle ───────────────────────────────────────────────────

export enum OpportunityStatus {
  DRAFT       = 'draft',
  MODERATION  = 'moderation',    // Submitted for review
  PUBLISHED   = 'published',     // Live and visible
  ENGAGED     = 'engaged',       // At least one active engagement
  CLOSED      = 'closed',        // Fulfilled / expired / cancelled
  REJECTED    = 'rejected',      // Failed moderation
}

export enum ApplicationStatus {
  PENDING    = 'pending',
  SHORTLISTED = 'shortlisted',
  ACCEPTED   = 'accepted',
  DECLINED   = 'declined',
  WITHDRAWN  = 'withdrawn',
}

export enum EngagementStatus {
  INITIATED  = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED  = 'completed',
  CANCELLED  = 'cancelled',
  DISPUTED   = 'disputed',   // flagged — Foundation doesn't arbitrate, but can moderate
}

// ─── User Roles ──────────────────────────────────────────────────────────────

export enum UserRole {
  PARTICIPANT      = 'participant',   // default — can be both Requester & Provider
  GOVERNANCE_MEMBER = 'governance_member',
  MODERATOR        = 'moderator',
  ADMIN            = 'admin',
}

export enum ParticipantType {
  INDIVIDUAL  = 'individual',
  ORGANIZATION = 'organization',
  AGENCY      = 'agency',
}

export enum AccountStatus {
  ACTIVE     = 'active',
  SUSPENDED  = 'suspended',
  RESTRICTED = 'restricted',
  PENDING_VERIFICATION = 'pending_verification',
}

// ─── Governance ──────────────────────────────────────────────────────────────

export enum CouncilType {
  EGC        = 'egc',         // Economic Governance Council
  DEP        = 'dep',         // Domain Expert Panel
  MODERATION = 'moderation',  // Trust & Moderation Operations Cell
}

export enum ModerationDecision {
  APPROVED          = 'approved',
  REJECTED          = 'rejected',
  APPROVED_WITH_EDITS = 'approved_with_edits',
  ESCALATED         = 'escalated',
}

export enum EnforcementActionType {
  WARNING    = 'warning',
  BADGE_REVOKE = 'badge_revoke',
  RESTRICT   = 'restrict',
  SUSPEND    = 'suspend',
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export enum AuditEntityType {
  USER        = 'user',
  OPPORTUNITY = 'opportunity',
  APPLICATION = 'application',
  ENGAGEMENT  = 'engagement',
  TRUST_BADGE = 'trust_badge',
  TRUST_LEVEL = 'trust_level',
  MODERATION  = 'moderation',
  ENFORCEMENT = 'enforcement',
}
