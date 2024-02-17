import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';

export function GetPostViewSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Get post view by id',
    }),
    ApiOkResponse({ type: ResponsePostDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
