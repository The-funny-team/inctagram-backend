import { FileType } from '@libs/types/fileType.enum';

export interface IFile {
  _id?: string;
  userId: string;
  fileType: FileType;
  originalname: string;
  format: string;
  url: string;
  fileId: string;
  ownerId?: string;
  expirationDate?: Date;
}
