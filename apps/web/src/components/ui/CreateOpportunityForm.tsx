'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateOpportunitySchema } from '@udyogasakha/validators';
import type { CreateOpportunityInput } from '@udyogasakha/validators';
import { ModuleType, TrustLevel } from '@udyogasakha/types';
import { useCreateOpportunity } from '@/hooks/useOpportunities';
import { moduleTypeLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MODULE_OPTIONS = Object.values(ModuleType).map((v) => ({ value: v, label: moduleTypeLabel(v) }));

const TRUST_LEVEL_OPTIONS = [
  { value: TrustLevel.L0_REGISTERED,              label: 'L0 — Open to all registered users' },
  { value: TrustLevel.L1_DOCUMENT_VERIFIED,       label: 'L1 — Document verified only' },
  { value: TrustLevel.L2_FOUNDATION_SCREENED,     label: 'L2 — Foundation screened only' },
  { value: TrustLevel.L3_DOMAIN_EXPERT_CERTIFIED, label: 'L3 — Expert certified only' },
];

// Module-specific extra fields rendered in step 2
function ModuleSpecificFields({ moduleType, register }: { moduleType: ModuleType; register: any }) {
  switch (moduleType) {
    case ModuleType.EMPLOYMENT_EXCHANGE:
      return (
        <div className="space-y-4">
          <div>
            <label className="field-label">Employment Type</label>
            <select {...register('details.employmentType')} className="field-input">
              {['full_time', 'part_time', 'contract', 'internship', 'advisory', 'fractional'].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Industry</label>
            <input {...register('details.industry')} className="field-input" placeholder="e.g. Information Technology" />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input {...register('details.location')} className="field-input" placeholder="City or Remote" />
          </div>
        </div>
      );

    case ModuleType.SERVICE_ENGAGEMENT:
      return (
        <div className="space-y-4">
          <div>
            <label className="field-label">Service Category</label>
            <input {...register('details.serviceCategory')} className="field-input" placeholder="e.g. Pujari, Vadika Chef, Event Coordinator" />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input {...register('details.location')} className="field-input" placeholder="Where the service is needed" />
          </div>
          <div>
            <label className="field-label">Duration</label>
            <input {...register('details.duration')} className="field-input" placeholder="e.g. 3 hours, 1 day" />
          </div>
        </div>
      );

    case ModuleType.PROJECT_TENDER:
      return (
        <div className="space-y-4">
          <div>
            <label className="field-label">Project Type</label>
            <select {...register('details.projectType')} className="field-input">
              {['announcement', 'rfp', 'tender', 'bid'].map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Timeline</label>
            <input {...register('details.timeline')} className="field-input" placeholder="e.g. 3 months" />
          </div>
        </div>
      );

    case ModuleType.TRAINING_SKILL_DEV:
      return (
        <div className="space-y-4">
          <div>
            <label className="field-label">Course / Programme Title</label>
            <input {...register('details.courseTitle')} className="field-input" placeholder="Programme name" />
          </div>
          <div>
            <label className="field-label">Mode</label>
            <select {...register('details.mode')} className="field-input">
              {['online', 'offline', 'hybrid'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Duration</label>
            <input {...register('details.duration')} className="field-input" placeholder="e.g. 4 weeks" />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-400 italic">
          Fill in the core details above. Module-specific fields will be added in a future update.
        </p>
      );
  }
}

const STEPS = ['Module & Basics', 'Details', 'Review & Submit'];

export function CreateOpportunityForm() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const mutation = useCreateOpportunity();

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(CreateOpportunitySchema),
    defaultValues: {
      moduleType: ModuleType.EMPLOYMENT_EXCHANGE,
      trustLevelRequired: TrustLevel.L1_DOCUMENT_VERIFIED,
      isPublic: true,
      details: {},
    },
  });

  const moduleType = watch('moduleType');
  const values = watch();

  const nextStep = async () => {
    const fields: any[] = step === 0 ? ['moduleType', 'title', 'description', 'trustLevelRequired'] : [];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = (data: CreateOpportunityInput) => {
    mutation.mutate(data, {
      onSuccess: () => router.push('/opportunities/my'),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
              i < step  ? 'bg-[#1D9E75] text-white' :
              i === step ? 'bg-[#1D9E75] text-white ring-4 ring-teal-100' :
              'bg-gray-100 text-gray-400',
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={cn('text-sm', i === step ? 'text-gray-900 font-medium' : 'text-gray-400')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Step 0 — Module & Basics */}
        {step === 0 && (
          <>
            <div>
              <label className="field-label">Opportunity Module</label>
              <select {...register('moduleType')} className="field-input">
                {MODULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Title</label>
              <input {...register('title')} className="field-input" placeholder="Clear, specific title for your opportunity" />
              {errors.title && <p className="field-error">{errors.title.message}</p>}
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea {...register('description')} rows={5} className="field-input resize-none"
                placeholder="Describe the opportunity, requirements, and what you are looking for" />
              {errors.description && <p className="field-error">{errors.description.message}</p>}
            </div>

            <div>
              <label className="field-label">Minimum Trust Level Required</label>
              <select {...register('trustLevelRequired')} className="field-input">
                {TRUST_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Only participants at this level or above can respond.</p>
            </div>

            <div className="flex items-center gap-2">
              <input {...register('isPublic')} type="checkbox" id="isPublic" className="rounded" />
              <label htmlFor="isPublic" className="text-sm text-gray-700">Visible to all members (uncheck for verified-only visibility)</label>
            </div>
          </>
        )}

        {/* Step 1 — Module-specific details */}
        {step === 1 && (
          <>
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">
              {moduleTypeLabel(moduleType)} — specific details
            </h3>
            <ModuleSpecificFields moduleType={moduleType} register={register} />
          </>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Module</span>
                <span className="font-medium">{moduleTypeLabel(values.moduleType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Title</span>
                <span className="font-medium text-right max-w-xs">{values.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Min trust level</span>
                <span className="font-medium">{values.trustLevelRequired?.toString().replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Visibility</span>
                <span className="font-medium">{values.isPublic ? 'Public' : 'Verified members only'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Your opportunity will be submitted for moderation review before going live. The Foundation will review and publish within a reasonable timeframe.
            </p>
            {mutation.isError && (
              <p className="text-sm text-red-500">Submission failed — please try again.</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="px-5 py-2 text-sm font-medium bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] transition-colors">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 text-sm font-medium bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] transition-colors disabled:opacity-60">
              {mutation.isPending ? 'Submitting…' : 'Submit for Review'}
            </button>
          )}
        </div>
      </form>

      {/* Shared input styles via global CSS */}
      <style jsx global>{`
        .field-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .field-input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
        .field-input:focus { ring: 2px solid #1D9E75; border-color: #1D9E75; }
        .field-error { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}
