'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@udyogasakha/api-client';
import { useCloseEngagement, useSubmitFeedback } from '@/hooks/useEngagements';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { EngagementStatus } from '@udyogasakha/types';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-200'} hover:text-amber-400`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const { data: engagement, isLoading } = useQuery({
    queryKey: ['engagement', id],
    queryFn: () => apiClient.get(`/engagements/${id}`).then((r) => (r.data as any).data),
    enabled: !!id,
  });

  const closeMutation = useCloseEngagement();
  const feedbackMutation = useSubmitFeedback();

  const handleComplete = () => {
    closeMutation.mutate(
      { id, status: EngagementStatus.COMPLETED },
      {
        onSuccess: () => toast('Engagement marked as completed'),
        onError: () => toast('Failed to complete engagement', 'error'),
      },
    );
  };

  const handleFeedback = () => {
    if (!rating) return;
    feedbackMutation.mutate(
      { engagementId: id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast('Feedback submitted — thank you!');
          setFeedbackSubmitted(true);
        },
        onError: () => toast('Failed to submit feedback', 'error'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Engagement not found.</p>
        <Link href="/engagements" className="text-sm text-[#1D9E75] hover:underline mt-2 block">
          ← Back to engagements
        </Link>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    INITIATED:   'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-teal-50 text-teal-700',
    COMPLETED:   'bg-green-50 text-green-700',
    CANCELLED:   'bg-gray-100 text-gray-500',
    DISPUTED:    'bg-red-50 text-red-700',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link href="/engagements" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to engagements
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {engagement.opportunity?.title ?? 'Engagement'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Started {formatDate(engagement.startedAt)}</p>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[engagement.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {engagement.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
          <div>
            <p className="text-gray-400">Requester ID</p>
            <p className="font-mono text-xs text-gray-600 mt-0.5">{engagement.requesterId}</p>
          </div>
          <div>
            <p className="text-gray-400">Provider ID</p>
            <p className="font-mono text-xs text-gray-600 mt-0.5">{engagement.providerId}</p>
          </div>
          {engagement.closedAt && (
            <div>
              <p className="text-gray-400">Closed</p>
              <p className="text-gray-700 mt-0.5">{formatDate(engagement.closedAt)}</p>
            </div>
          )}
          {engagement.closureNote && (
            <div>
              <p className="text-gray-400">Closure note</p>
              <p className="text-gray-700 mt-0.5">{engagement.closureNote}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {['INITIATED', 'IN_PROGRESS'].includes(engagement.status) && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleComplete}
              disabled={closeMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {closeMutation.isPending ? 'Updating…' : 'Mark as Completed'}
            </button>
            <button
              onClick={() => closeMutation.mutate({ id, status: EngagementStatus.CANCELLED })}
              disabled={closeMutation.isPending}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel Engagement
            </button>
          </div>
        )}
      </div>

      {/* Feedback section — only for completed engagements */}
      {engagement.status === EngagementStatus.COMPLETED && !feedbackSubmitted && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-medium text-gray-700">Leave Feedback</h2>
          <p className="text-sm text-gray-400">
            Your feedback helps build trust in the ecosystem. It's visible to the recipient.
          </p>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              placeholder="Share your experience…"
            />
          </div>

          <button
            onClick={handleFeedback}
            disabled={!rating || feedbackMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] disabled:opacity-60 transition-colors"
          >
            {feedbackMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="bg-teal-50 rounded-xl border border-teal-100 p-5 text-center">
          <p className="text-teal-700 font-medium">Feedback submitted ✓</p>
          <p className="text-sm text-teal-600 mt-1">Thank you for contributing to ecosystem trust.</p>
        </div>
      )}
    </div>
  );
}
