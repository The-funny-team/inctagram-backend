import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadGatewayResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '../../responses';
import { NOT_FOUND } from '../swagger.constants';

export function UploadUserAvatarSwaggerDecorator() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Upload user avatar',
    }),
    ApiCreatedResponse(),
    ApiNotFoundResponse({ type: ApiErrorResponse, description: NOT_FOUND }),
    ApiBadGatewayResponse({ type: ApiErrorResponse }),
  );
}
