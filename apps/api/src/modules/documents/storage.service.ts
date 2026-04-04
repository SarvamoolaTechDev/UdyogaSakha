import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface StoredFile {
  documentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  /** URL or key that can be used to retrieve the file */
  storageKey: string;
}

/**
 * StorageService — provider-agnostic document storage.
 *
 * Current implementation: local filesystem at ./uploads/documents/
 * Phase 2 upgrade path:
 *   - AWS S3:        swap uploadBuffer() to s3.send(new PutObjectCommand(...))
 *   - Cloudflare R2: same AWS SDK, different endpoint + credentials
 *   - Google Cloud:  swap to storage.bucket().file().save()
 *
 * The service contract (uploadBuffer, getUrl, delete) stays the same.
 * No calling code needs to change when the provider is swapped.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads', 'documents');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<StoredFile> {
    const ext = originalName.split('.').pop() ?? 'bin';
    const documentId = randomUUID();
    const filename = `${documentId}.${ext}`;
    const storageKey = `documents/${filename}`;
    const dest = join(this.uploadDir, filename);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(dest);
      stream.write(buffer);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    this.logger.log(`Stored file ${filename} (${buffer.length} bytes)`);

    return {
      documentId,
      filename: originalName,
      mimeType,
      sizeBytes: buffer.length,
      storageKey,
    };
  }

  /**
   * Returns the URL to access the file.
   * - Local: served via static file middleware at /uploads/documents/:filename
   * - S3/R2: returns a presigned URL or CDN URL
   */
  getUrl(storageKey: string): string {
    const filename = storageKey.split('/').pop();
    // TODO Phase 2: return presigned S3/R2 URL
    return `/uploads/documents/${filename}`;
  }

  async delete(storageKey: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    const filename = storageKey.split('/').pop()!;
    const filePath = join(this.uploadDir, filename);
    try {
      await unlink(filePath);
    } catch {
      // File may already be deleted — log but don't throw
      this.logger.warn(`Could not delete file ${filePath}`);
    }
  }
}
