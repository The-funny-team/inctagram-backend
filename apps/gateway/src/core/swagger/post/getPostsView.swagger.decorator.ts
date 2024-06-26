import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';
import { ResponsePostsViewDto } from '@gateway/src/features/post/responses/responsePost.dto';

export function GetPostsViewSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get posts',
    }),
    ApiOkResponse({ type: ResponsePostsViewDto, isArray: true }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
