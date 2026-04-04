import { apiClient } from '../client';

export interface UserDocument {
  documentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export const documentsApi = {
  list: () =>
    apiClient.get<UserDocument[]>('/documents').then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<UserDocument>('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  delete: (documentId: string) =>
    apiClient.delete(`/documents/${documentId}`).then((r) => r.data),
};
