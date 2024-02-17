import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '../../responses';
import { NOT_FOUND, NOT_PERMITTED, UNAUTHORIZED } from '../swagger.constants';

export function DeletePostSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      type: ApiErrorResponse,
      description: UNAUTHORIZED,
    }),
    ApiOperation({
      summary: 'Delete post',
    }),
    ApiForbiddenResponse({
      description: NOT_PERMITTED,
    }),
    ApiNoContentResponse(),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
