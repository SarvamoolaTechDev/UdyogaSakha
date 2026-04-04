'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@udyogasakha/api-client';
import { useToast } from './Toast';

interface UserDocument {
  documentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

function useMyDocuments() {
  return useQuery<UserDocument[]>({
    queryKey: ['documents', 'mine'],
    queryFn: () => apiClient.get('/documents').then((r) => r.data),
  });
}

function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      apiClient.delete(`/documents/${documentId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MIME_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/webp': '🖼️',
};

export function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { data: docs = [], isLoading } = useMyDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast('File too large — maximum 5 MB', 'error');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast('Only PDF, JPEG, PNG, or WebP files are accepted', 'error');
      return;
    }
    uploadMutation.mutate(file, {
      onSuccess: (doc) => toast(`${doc.filename} uploaded`),
      onError: () => toast('Upload failed — please try again', 'error'),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = (documentId: string, filename: string) => {
    if (!confirm(`Remove "${filename}"?`)) return;
    deleteMutation.mutate(documentId, {
      onSuccess: () => toast('Document removed'),
      onError: () => toast('Failed to remove document', 'error'),
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-[#1D9E75] bg-teal-50'
            : 'border-gray-200 hover:border-[#1D9E75] hover:bg-gray-50'
        }`}
      >
        {uploadMutation.isPending ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Uploading…</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl">📎</p>
            <p className="text-sm font-medium text-gray-700">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-gray-400">PDF, JPEG, PNG, WebP · Max 5 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.documentId}
              className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{MIME_ICONS[doc.mimeType] ?? '📎'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(doc.sizeBytes)} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.documentId, doc.filename)}
                disabled={deleteMutation.isPending}
                className="shrink-0 text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400">
        These documents are used for trust verification. Include only government-issued identity
        documents or qualification certificates.
      </p>
    </div>
  );
}
