import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AuthSwagger } from './auth.enum';
import { BAD_REQUEST, UNAUTHORIZED } from '../swagger.constants';
import { ResponseAccessTokenDto } from '../../../features/device/responses';
import { LoginDto } from '../../../features/auth/dto/login.dto';
import { BadRequestResponse } from '../../responses';

export function LoginSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: AuthSwagger.login,
    }),
    ApiBody({
      type: LoginDto,
    }),
    ApiOkResponse({
      description: AuthSwagger.jwtOk,
      type: ResponseAccessTokenDto,
    }),
    ApiBadRequestResponse({
      description: BAD_REQUEST,
      type: BadRequestResponse,
    }),
    ApiUnauthorizedResponse({
      description: UNAUTHORIZED,
    }),
  );
}
