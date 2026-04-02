'use client';

import { useState } from 'react';
import { useApply } from '@/hooks/useEngagements';
import { useToast } from './Toast';

interface ApplyModalProps {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
}

export function ApplyModal({ opportunityId, opportunityTitle, onClose }: ApplyModalProps) {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const applyMutation = useApply();

  const handleSubmit = () => {
    applyMutation.mutate(
      { opportunityId, coverMessage: message.trim() || undefined },
      {
        onSuccess: () => {
          toast('Expression of interest submitted!');
          onClose();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? 'Already applied or an error occurred.';
          toast(msg, 'error');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">Express Interest</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">"{opportunityTitle}"</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            placeholder="Briefly describe why you are a good fit for this opportunity…"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/2000</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={applyMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] disabled:opacity-60 transition-colors"
          >
            {applyMutation.isPending ? 'Submitting…' : 'Submit Interest'}
          </button>
        </div>
      </div>
    </div>
  );
}
