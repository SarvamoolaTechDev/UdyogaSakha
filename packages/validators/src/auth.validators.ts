import { z } from 'zod';
import { ParticipantType } from '@udyogasakha/types';

export const RegisterSchema = z.object({
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  fullName: z.string().min(2, 'Full name required').max(120),
  participantType: z.nativeEnum(ParticipantType),
  organizationName: z.string().min(2).max(200).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const OtpRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

export const OtpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
