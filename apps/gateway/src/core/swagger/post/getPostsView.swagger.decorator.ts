import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';

export function GetPostsViewSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get posts',
    }),
    ApiOkResponse({ type: ResponsePostDto, isArray: true }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
