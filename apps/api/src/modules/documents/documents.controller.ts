import {
  Controller, Post, Delete, Get, Param,
  UploadedFile, UseInterceptors, UseGuards,
  BadRequestException, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/roles.decorator';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'PDF or image, max 5 MB' },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a document for trust verification',
    description: 'Accepts PDF, JPEG, PNG, or WebP. Max 5 MB. Returns a documentId to include in POST /trust/request-verification.',
  })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /jpeg|png|webp|pdf/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const stored = await this.storage.uploadBuffer(file.buffer, file.originalname, file.mimetype);

    // Persist document record in DB
    const doc = await this.prisma.userDocument.create({
      data: {
        userId,
        filename: stored.filename,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        storageKey: stored.storageKey,
        documentId: stored.documentId,
      },
    });

    return {
      documentId: doc.documentId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      uploadedAt: doc.uploadedAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List my uploaded documents' })
  async listMine(@CurrentUser('id') userId: string) {
    const docs = await this.prisma.userDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        documentId: true, filename: true, mimeType: true,
        sizeBytes: true, uploadedAt: true,
      },
    });
    return docs;
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete one of my documents' })
  async remove(
    @Param('documentId') documentId: string,
    @CurrentUser('id') userId: string,
  ) {
    const doc = await this.prisma.userDocument.findFirst({
      where: { documentId, userId },
    });
    if (!doc) throw new BadRequestException('Document not found');

    await this.storage.delete(doc.storageKey);
    await this.prisma.userDocument.delete({ where: { id: doc.id } });
    return { deleted: true };
  }
}
