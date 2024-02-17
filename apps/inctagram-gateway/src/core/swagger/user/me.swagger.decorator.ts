import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';

export function MeSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'User profiler',
    }),
    ApiOkResponse({ type: ResponseUserDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
