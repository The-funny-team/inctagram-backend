import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { NOT_FOUND } from '../swagger.constants';
import { ApiErrorResponse } from '../../responses';

export function MeSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Me profiler',
    }),
    ApiOkResponse({ type: ResponseUserDto }),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
  );
}
