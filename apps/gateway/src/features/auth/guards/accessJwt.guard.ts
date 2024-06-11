import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@gateway/src/core';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access') {}

export const AppAuthGuard = () =>
  applyDecorators(
    UseGuards(AccessTokenGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ type: ApiErrorResponse }),
  );
