import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, BadRequestResponse } from '../../responses';
import { FileUploadResponse } from '@libs/contracts';
import { BAD_REQUEST } from '../swagger.constants';

export function UploadImagePostSwaggerDecorator() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Upload image post',
    }),
    ApiCreatedResponse({ type: FileUploadResponse }),
    ApiBadRequestResponse({
      description: BAD_REQUEST,
      type: BadRequestResponse,
    }),
    ApiBadGatewayResponse({ type: ApiErrorResponse }),
  );
}
