import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageAdapter } from '../../adapters';
import { getModelToken } from '@nestjs/mongoose';
import { File } from '../../models/file.model';
import { FileRepository } from '../../db/file.repository';

import {
  DeleteFilesCommand,
  DeleteFilesUseCase,
} from '@fileService/src/files/application/use-cases/deleteFiles.usecase';

// TODO можно ли как-то ускорить тест?

describe('DeleteFileUseCases', () => {
  let module: TestingModule;
  let fileStorageAdapter: S3StorageAdapter;
  let fileRepo: FileRepository;
  let deleteFilesUseCase: DeleteFilesUseCase;
  //let fileModelMock: jest.Mocked<Model<File>>;

  const mockFileModel = {
    db: {
      startSession: jest.fn(() => ({
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      })),
    },
    deleteMany: jest.fn(),
  };

  const mockS3StorageAdapter = {
    deleteImages: jest.fn(),
  };

  const mockFileRepository = {
    findFilesByIds: jest.fn(),
    deleteFiles: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DeleteFilesUseCase,
        { provide: S3StorageAdapter, useValue: mockS3StorageAdapter },
        { provide: FileRepository, useValue: mockFileRepository },
        { provide: getModelToken(File.name), useValue: mockFileModel },
      ],
    }).compile();

    fileStorageAdapter = module.get<S3StorageAdapter>(S3StorageAdapter);
    fileRepo = module.get<FileRepository>(FileRepository);
    deleteFilesUseCase = module.get<DeleteFilesUseCase>(DeleteFilesUseCase);
    //fileModelMock = module.get(getModelToken(File.name));
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await module.close();
  });

  describe('execute', () => {
    it('should delete files', async () => {
      const mockFile = ['ids'];

      const spyfindFileByIds = jest
        .spyOn(fileRepo, 'findFilesByIds')
        .mockReturnValueOnce(mockFile as any);

      jest.spyOn(fileRepo, 'deleteFiles').mockReturnValueOnce(true as any);
      jest
        .spyOn(fileStorageAdapter, 'deleteImages')
        .mockReturnValueOnce(true as any);

      //mockFileModel.deleteMany.mockRejectedValue(new Error('Delete failed'));

      const command = new DeleteFilesCommand(mockFile);
      const result = await deleteFilesUseCase.execute(command);

      const findFileResponse = spyfindFileByIds.mock.results[0].value;
      expect(fileRepo.findFilesByIds).toHaveBeenCalled();
      expect(findFileResponse).toEqual(mockFile);

      expect(mockFileModel.deleteMany).toHaveBeenCalled();

      expect(fileStorageAdapter.deleteImages).toHaveBeenCalled();

      expect(result.isSuccess).toBe(true);
    });

    it('should be file deletion error, wrong file id', async () => {
      const spyfindFileByIds = jest
        .spyOn(fileRepo, 'findFilesByIds')
        .mockReturnValueOnce(null);

      jest
        .spyOn(fileStorageAdapter, 'deleteImages')
        .mockReturnValueOnce(true as any);

      const command = new DeleteFilesCommand(['']);
      const result = await deleteFilesUseCase.execute(command);

      const findFileResponse = spyfindFileByIds.mock.results[0].value;
      expect(fileRepo.findFilesByIds).toHaveBeenCalled();
      expect(findFileResponse).toBeNull();

      expect(fileRepo.deleteFiles).not.toHaveBeenCalled();
      expect(fileStorageAdapter.deleteImages).not.toHaveBeenCalled();

      expect(result.isSuccess).toBe(false);
    });
  });
});
