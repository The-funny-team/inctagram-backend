import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';

export function uploadImageConfig() {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 20000000 }),
      new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
    ],
    fileIsRequired: true,
    exceptionFactory: (error) => {
      throw new BadRequestException([{ message: error, field: 'image' }]);
    },
  });
}
