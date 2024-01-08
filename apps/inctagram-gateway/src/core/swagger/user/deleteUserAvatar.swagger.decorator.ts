import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '../../responses';
import { NOT_FOUND } from '../swagger.constants';

export function DeleteUserAvatarSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Delete user avatar',
    }),
    ApiNoContentResponse(),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
    ApiBadGatewayResponse({ type: ApiErrorResponse }),
  );
}
