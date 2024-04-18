import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, BadRequestResponse } from '../../responses';
import { BAD_REQUEST, NOT_FOUND } from '../swagger.constants';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { NOT_PERMITTED } from '@gateway/src/core/swagger/swagger.constants';

export function UpdatePostSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Update post description',
    }),
    ApiForbiddenResponse({
      description: NOT_PERMITTED,
    }),
    ApiOkResponse({ type: ResponsePostDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
    ApiBadRequestResponse({
      description: BAD_REQUEST,
      type: BadRequestResponse,
    }),
  );
}
