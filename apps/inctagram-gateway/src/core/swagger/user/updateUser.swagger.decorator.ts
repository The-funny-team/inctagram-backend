import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { ApiErrorResponse, BadRequestResponse } from '../../responses';
import { BAD_REQUEST, NOT_FOUND } from '../swagger.constants';

export function UpdateUserSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Update user profiler',
    }),
    ApiOkResponse({ type: ResponseUserDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
    ApiBadRequestResponse({
      description: BAD_REQUEST,
      type: BadRequestResponse,
    }),
  );
}
