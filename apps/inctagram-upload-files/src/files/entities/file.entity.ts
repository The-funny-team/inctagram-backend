import { FileType } from '@libs/types/fileType.enum';
import { IFile } from '../interface/file.interface';
import { FileSaveResponse } from '../types/fileSave.response';

export class FileEntity implements IFile {
  _id?: string;
  userId: string;
  fileType: FileType;
  originalname: string;
  format: string;
  url: string;
  fileId: string;
  ownerId?: string;
  expirationDate?: Date;

  constructor(file: IFile) {
    this._id = file._id;
    this.userId = file.userId;
    this.fileType = file.fileType;
    this.originalname = file.originalname;
    this.format = file.format;
    this.url = file.url;
    this.fileId = file.fileId;
    this.ownerId = file.ownerId;
    this.expirationDate = file.expirationDate;
  }

  updateFileInfo(fileInfo: FileSaveResponse) {
    this.url = fileInfo.url;
    this.fileId = fileInfo.fileId;
    return this;
  }

  setOwnerId(ownerId: string) {
    this.ownerId = ownerId;
  }

  updateExpirationDate(date: Date) {
    this.expirationDate = date;
  }
}
