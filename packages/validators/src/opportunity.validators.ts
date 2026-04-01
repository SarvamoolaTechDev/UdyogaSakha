import { z } from 'zod';
import { ModuleType, TrustLevel } from '@udyogasakha/types';

export const CreateOpportunitySchema = z.object({
  moduleType: z.nativeEnum(ModuleType),
  title: z.string().min(5, 'Title too short').max(200),
  description: z.string().min(20, 'Description too short').max(5000),
  trustLevelRequired: z.nativeEnum(TrustLevel).default(TrustLevel.L1_DOCUMENT_VERIFIED),
  isPublic: z.boolean().default(true),
  closesAt: z.coerce.date().optional(),
  details: z.record(z.unknown()),  // Module-specific — validated per module in service layer
});

export const OpportunityFiltersSchema = z.object({
  moduleType: z.nativeEnum(ModuleType).optional(),
  search: z.string().max(200).optional(),
  trustLevelRequired: z.nativeEnum(TrustLevel).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const SubmitApplicationSchema = z.object({
  opportunityId: z.string().uuid(),
  coverMessage: z.string().max(2000).optional(),
});

export const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>;
export type OpportunityFiltersInput = z.infer<typeof OpportunityFiltersSchema>;
