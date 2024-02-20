// import { Controller, Get, Param } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { CommandBus } from '@nestjs/cqrs';
// import { PostQueryRepository } from '@gateway/src/features/post/db/post.query.repository';
// import { ResponsePostDto } from '../responses/responsePost.dto';
// import { GetPostViewSwaggerDecorator } from '@gateway/src/core/swagger/post/getPostView.swagger.decorator';
//
// const baseUrl = '/public/post';
//
// // export const endpoints = {
// //   updatePost: () => `${baseUrl}/:id`,
// //   uploadImagePost: () => `${baseUrl}/image`,
// //   createPost: () => `${baseUrl}`,
// //   getPost: () => `${baseUrl}/:id`,
// //   deletePost: (id: string) => `${baseUrl}/${id}`,
// // };
//
// @ApiTags('public/post')
// @ApiBearerAuth()
// @Controller('public/post')
// export class PublicPostController {
//   constructor(
//     private readonly commandBus: CommandBus,
//     private readonly postQueryRepo: PostQueryRepository,
//   ) {}
//
//   @GetPostViewSwaggerDecorator()
//   @Get(':id')
//   async getPost(@Param('id') postId: string): Promise<ResponsePostDto> {
//     return this.getPostView(postId, userId);
//   }
//
//   private async getPostView(
//     postId: string,
//     userId: string,
//   ): Promise<ResponsePostDto> {
//     const postViewResult = await this.postQueryRepo.getPostViewById(
//       postId,
//       userId,
//     );
//
//     if (!postViewResult.isSuccess) {
//       throw postViewResult.err;
//     }
//     return postViewResult.value;
//   }
// }
