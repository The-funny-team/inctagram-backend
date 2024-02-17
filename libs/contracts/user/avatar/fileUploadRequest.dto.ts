import { FileType } from '@libs/types/fileType.enum';

export class FileUploadRequest {
  id?: string;
  userId: string;
  originalname: string;
  buffer: Buffer;
  format: string;
  fileType: FileType;
  ownerId?: string;
  expirationDate?: Date;
}
