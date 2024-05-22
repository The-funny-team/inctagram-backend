import { Test, TestingModule } from '@nestjs/testing';
import { UploadFileCommand, UploadFileUseCase } from './uploadFile.usecase';
import { S3StorageAdapter } from '../../adapters';
import { FileSaveResponse } from '../../types/fileSave.response';
import { getModelToken } from '@nestjs/mongoose';
import { File } from '../../models/file.model';
import { Model } from 'mongoose';
import { FileUploadRequest } from '@libs/contracts';
import { FileType } from '@libs/types/fileType.enum';
import { FileRepository } from '../../db/file.repository';
import { AppModule } from '@fileService/src/app.module';

describe('UploadFileUseCase', () => {
  let module: TestingModule;
  let fileStorageAdapter: S3StorageAdapter;
  let fileModel: Model<File>;
  let useCase: UploadFileUseCase;
  // let fileRepo: FileRepository;

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
        UploadFileUseCase,
        { provide: S3StorageAdapter, useValue: mockS3StorageAdapter },
        FileRepository,
        { provide: getModelToken(File.name), useValue: mockFileModel },
      ],
    }).compile();

    fileStorageAdapter = module.get<S3StorageAdapter>(S3StorageAdapter);
    //fileRepo = module.get<FileRepository>(FileRepository);
    useCase = module.get<UploadFileUseCase>(UploadFileUseCase);
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

      const payload: FileUploadRequest = {
        userId: 'userId',
        originalname: 'originalname',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete saveResponse.buffer;

      jest
        .spyOn(fileModel.prototype, 'save')
        .mockImplementationOnce(() => Promise.resolve(saveResponse));

      const command = new UploadFileCommand(payload);
      const result = await useCase.execute(command);

      expect(result.fileId).toBe(fileIdResponse._id);
    });
  });

  // it(`Sending image`, async () => {
  //   const imagePath = join(__dirname, 'wallpaper.jpg');
  //   const imageData = fs.readFileSync(imagePath);
  //
  //   console.log(imagePath);
  //
  //   const payload: FileUploadRequest = {
  //     userId: 'userId',
  //     originalname: 'originalname',
  //     buffer: imageData,
  //     format: 'jpg',
  //     fileType: FileType.Avatar,
  //   };
  //
  //   const response = await useCase.execute({ payload });
  //
  //   console.log(response);
  //
  //   // await new Promise((resolve) => setTimeout(resolve, 5000));
  // });
  //
  // it(`Get file info`, async () => {
  //   const fileInfo = await fileRepo.findFileById('65e63d07142e9e69792dbaea');
  //   console.log(fileInfo);
  // });
});
