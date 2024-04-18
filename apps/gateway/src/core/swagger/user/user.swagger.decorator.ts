import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';

export function UserSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'User profiler',
    }),
    ApiOkResponse({ type: ResponseUserDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
