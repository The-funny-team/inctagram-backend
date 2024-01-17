import { Test, TestingModule } from '@nestjs/testing';
import {
  UploadAvatarCommand,
  UploadAvatarUseCase,
} from './uploadAvatar.usecase';
import { S3StorageAdapter } from '../../adapters';
import { FileSaveResponse } from '../../types/fileSave.response';
import { getModelToken } from '@nestjs/mongoose';
import { File } from '../../models/file.model';
import { Model } from 'mongoose';
import { AvatarUploadRequest } from '@libs/contracts';
import { FileType } from '@libs/types/fileType.enum';
import { FileRepository } from '../../db/file.repository';
import { AppModule } from '@fileService/src/app.module';

// TODO можно ли как-то ускорить тест?

describe('UploadAvatarUseCase', () => {
  let module: TestingModule;
  let fileStorageAdapter: S3StorageAdapter;
  let fileModel: Model<File>;
  let useCase: UploadAvatarUseCase;

  const mockFileModel = {
    save: jest.fn(),
  };

  const mockS3StorageAdapter = {
    saveAvatar: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        UploadAvatarUseCase,
        { provide: S3StorageAdapter, useValue: mockS3StorageAdapter },
        FileRepository,
        { provide: getModelToken(File.name), useValue: mockFileModel },
      ],
    }).compile();

    fileStorageAdapter = module.get<S3StorageAdapter>(S3StorageAdapter);
    useCase = module.get<UploadAvatarUseCase>(UploadAvatarUseCase);
    fileModel = module.get<Model<File>>(getModelToken(File.name));
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await module.close();
  });

  describe('execute', () => {
    it('should upload the new file', async () => {
      const fileStorageResult: FileSaveResponse = {
        url: 'url',
        fileId: 'fileId',
      };

      jest
        .spyOn(fileStorageAdapter, 'saveAvatar')
        .mockReturnValueOnce(Promise.resolve(fileStorageResult));

      const payload: AvatarUploadRequest = {
        userId: 'userId',
        originalname: 'originalname',
        buffer: null,
        format: 'format',
        fileType: FileType.Avatar,
      };

      const fileIdResponse = { _id: 'id' };

      const saveResponse = Object.assign(
        payload,
        fileStorageResult,
        fileIdResponse,
      );
      delete saveResponse.buffer;

      jest
        .spyOn(fileModel.prototype, 'save')
        .mockImplementationOnce(() => Promise.resolve(saveResponse));

      const command = new UploadAvatarCommand(payload);
      const result = await useCase.execute(command);

      expect(result.fileId).toBe(fileIdResponse._id);
    });
  });
});
