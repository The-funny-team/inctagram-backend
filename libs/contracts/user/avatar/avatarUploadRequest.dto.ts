import { FileType } from '@libs/types/fileType.enum';

export class AvatarUploadRequest {
  id?: string;
  userId: string;
  originalname: string;
  buffer: Buffer;
  format: string;
  fileType: FileType;
}
