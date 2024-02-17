import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageAdapter } from '../../adapters';
import { getModelToken } from '@nestjs/mongoose';
import { File } from '../../models/file.model';
import { FileRepository } from '../../db/file.repository';
import { AppModule } from '@fileService/src/app.module';
import { DeleteFileCommand, DeleteFileUseCases } from './deleteFile.usecase';

// TODO можно ли как-то ускорить тест?

describe('DeleteFileUseCases', () => {
  let module: TestingModule;
  let fileStorageAdapter: S3StorageAdapter;
  let fileRepo: FileRepository;
  let useCase: DeleteFileUseCases;

  const mockFileModel = {
    save: jest.fn(),
  };

  const mockS3StorageAdapter = {
    deleteAvatar: jest.fn(),
  };

  const mockFileRepository = {
    findFileById: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DeleteFileUseCases,
        { provide: S3StorageAdapter, useValue: mockS3StorageAdapter },
        { provide: FileRepository, useValue: mockFileRepository },
        { provide: getModelToken(File.name), useValue: mockFileModel },
      ],
    }).compile();

    fileStorageAdapter = module.get<S3StorageAdapter>(S3StorageAdapter);
    useCase = module.get<DeleteFileUseCases>(DeleteFileUseCases);
    fileRepo = module.get<FileRepository>(FileRepository);
    // fileModel = module.get<Model<File>>(getModelToken(File.name));
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await module.close();
  });

  describe('execute', () => {
    it('should delete file by id', async () => {
      // TODO можно ли делать в тестах any или нужно все типизировать?
      // TODO как можно затипизировать произвольный класс для ответа?
      const mockFile = { url: 'url', _id: 'id' };

      const spyfindFileById = jest
        .spyOn(fileRepo, 'findFileById')
        .mockReturnValueOnce(mockFile as any);

      jest.spyOn(fileRepo, 'deleteFile').mockReturnValueOnce(true as any);
      jest
        .spyOn(fileStorageAdapter, 'deleteAvatar')
        .mockReturnValueOnce(true as any);

      const command = new DeleteFileCommand(mockFile._id);
      const result = await useCase.execute(command);

      const findFileResponse = spyfindFileById.mock.results[0].value;
      expect(fileRepo.findFileById).toHaveBeenCalled();
      expect(findFileResponse).toEqual(mockFile);

      expect(fileRepo.deleteFile).toHaveBeenCalled();
      expect(fileStorageAdapter.deleteAvatar).toHaveBeenCalled();

      expect(result.isSuccess).toBe(true);
    });

    it('should be file deletion error', async () => {
      const spyfindFileById = jest
        .spyOn(fileRepo, 'findFileById')
        .mockReturnValueOnce(null);

      jest.spyOn(fileRepo, 'deleteFile').mockReturnValueOnce(true as any);
      jest
        .spyOn(fileStorageAdapter, 'deleteAvatar')
        .mockReturnValueOnce(true as any);

      const command = new DeleteFileCommand('');
      const result = await useCase.execute(command);

      const findFileResponse = spyfindFileById.mock.results[0].value;
      expect(fileRepo.findFileById).toHaveBeenCalled();
      expect(findFileResponse).toBeNull();

      expect(fileRepo.deleteFile).not.toHaveBeenCalled();
      expect(fileStorageAdapter.deleteAvatar).not.toHaveBeenCalled();

      expect(result.isSuccess).toBe(false);
    });
  });
});
