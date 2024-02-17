import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { ResponseUserDto } from '../responses';
import { NotFoundError, Result } from '../../../core';
import { USER_NOT_FOUND } from '../user.constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { FileUrlResponse } from '@libs/contracts';

@Injectable()
export class UserQueryRepository {
  private logger = new Logger(UserQueryRepository.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
  ) {}

  async getUserViewById(id: string): Promise<Result<ResponseUserDto>> {
    const user = await this.prismaService.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!user) {
      return Result.Err(new NotFoundError(USER_NOT_FOUND));
    }

    if (!user.avatarId) {
      return Result.Ok(ResponseUserDto.getView(user));
    }

    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'get_file_url' }, { fileId: user.avatarId })
        .pipe(timeout(10000));
      const avatarUrl: FileUrlResponse = await firstValueFrom(
        responseOfService,
      );
      return Result.Ok(ResponseUserDto.getView(user, avatarUrl.url));
    } catch (error) {
      this.logger.log(`userId: ${id} - ${error}`);
      return Result.Ok(ResponseUserDto.getView(user));
    }
  }
}
