import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePostDto } from '@gateway/src/features/post/dto/updatePost.dto';
import { CurrentUserId } from '@gateway/src/core/decorators/currentUserId.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostCommand } from '@gateway/src/features/post/application/use-cases/updatePost.usecase';
import { AccessTokenGuard } from '@gateway/src/features/auth/guards/accessJwt.guard';
import { Result } from '../../../core';
import { PostQueryRepository } from '@gateway/src/features/post/db/post.query.repository';
import { UpdatePostSwaggerDecorator } from '@gateway/src/core/swagger/post/updatePost.swagger.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadImageConfig } from '../config/uploadImage.config';
import { ImageInputDto } from '../../user/dto';
import {
  CreatePostCommand,
  UploadImagePostCommand,
} from '../application/use-cases';
import { FileUploadResponse } from '@libs/contracts';
import { UploadImagePostSwaggerDecorator } from '@gateway/src/core/swagger/post/uploadImagePost.swagger.decorator';
import { CreatePostDto } from '../dto/createPost.dto';
import { ResponsePostDto } from '../responses/responsePost.dto';
import { CreatePostSwaggerDecorator } from '@gateway/src/core/swagger/post/createPost.swagger.decorator';
import { GetPostViewSwaggerDecorator } from '@gateway/src/core/swagger/post/getPostView.swagger.decorator';
import { DeletePostCommand } from '@gateway/src/features/post/application/use-cases/deletePost.usecase';
import { DeletePostSwaggerDecorator } from '@gateway/src/core/swagger/post/deletePost.swagger.decorator';

const baseUrl = '/post';

export const endpoints = {
  updatePost: () => `${baseUrl}/:id`,
  uploadImagePost: () => `${baseUrl}/image`,
  createPost: () => `${baseUrl}`,
  getPost: () => `${baseUrl}/:id`,
  deletePost: (id: string) => `${baseUrl}/${id}`,
};

@ApiTags('Post')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('post')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postQueryRepo: PostQueryRepository,
  ) {}

  @ApiOperation({
    summary: 'Editing Post',
  })
  @UpdatePostSwaggerDecorator()
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUserId() userId: string,
  ) {
    const updateResult = await this.commandBus.execute<
      UpdatePostCommand,
      Result
    >(new UpdatePostCommand(postId, updatePostDto, userId));

    if (!updateResult.isSuccess) throw updateResult.err;

    return this.getPostView(postId, userId);
  }

  @UploadImagePostSwaggerDecorator()
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImagePost(
    @CurrentUserId() userId: string,
    @UploadedFile(uploadImageConfig()) image: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    const imadeDto: ImageInputDto = {
      userId,
      originalname: image.originalname,
      buffer: image.buffer,
    };

    const downloadResult = await this.commandBus.execute<
      UploadImagePostCommand,
      Result<FileUploadResponse>
    >(new UploadImagePostCommand(imadeDto));
    if (!downloadResult.isSuccess) {
      throw downloadResult.err;
    }
    return downloadResult.value;
  }

  @CreatePostSwaggerDecorator()
  @Post()
  async createPost(
    @Body() createDto: CreatePostDto,
    @CurrentUserId() userId: string,
  ): Promise<ResponsePostDto> {
    const resultCreation = await this.commandBus.execute<CreatePostCommand>(
      new CreatePostCommand(createDto, userId),
    );

    if (!resultCreation.isSuccess) {
      throw resultCreation.err;
    }
    return this.getPostView(resultCreation.value.id, userId);
  }

  @GetPostViewSwaggerDecorator()
  @Get(':id')
  async getPost(
    @Param('id') postId: string,
    @CurrentUserId() userId: string,
  ): Promise<ResponsePostDto> {
    return this.getPostView(postId, userId);
  }

  private async getPostView(
    postId: string,
    userId: string,
  ): Promise<ResponsePostDto> {
    const postViewResult = await this.postQueryRepo.getPostViewById(
      postId,
      userId,
    );

    if (!postViewResult.isSuccess) {
      throw postViewResult.err;
    }
    return postViewResult.value;
  }

  @DeletePostSwaggerDecorator()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id') postId: string,
    @CurrentUserId() userId: string,
  ) {
    const deleteResult = await this.commandBus.execute<
      DeletePostCommand,
      Result
    >(new DeletePostCommand(postId, userId));

    if (!deleteResult.isSuccess) throw deleteResult.err;

    return deleteResult;
  }
}
