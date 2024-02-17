import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, BadRequestResponse } from '../../responses';
import { BAD_REQUEST } from '../swagger.constants';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';

export function CreatePostSwaggerDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
    ApiOperation({
      summary: 'Create post',
    }),
    ApiCreatedResponse({ type: ResponsePostDto }),
    ApiBadRequestResponse({
      description: BAD_REQUEST,
      type: BadRequestResponse,
    }),
    ApiBadGatewayResponse({ type: ApiErrorResponse }),
  );
}
