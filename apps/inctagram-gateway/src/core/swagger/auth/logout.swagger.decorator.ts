import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NO_CONTENT, UNAUTHORIZED } from '../swagger.constants';
import { AuthSwagger } from './auth.enum';

export function LogoutSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: AuthSwagger.logout,
    }),
    ApiNoContentResponse({
      description: NO_CONTENT,
    }),
    ApiUnauthorizedResponse({
      description: UNAUTHORIZED,
    }),
  );
}
