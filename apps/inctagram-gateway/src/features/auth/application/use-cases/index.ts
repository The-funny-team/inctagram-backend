import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { GoogleLoginUseCase } from './googleLogin.usecase';

export * from './baseProviderLogin.usecase';
export * from './googleLogin.usecase';

export const AUTH_USE_CASES: Type<ICommandHandler>[] = [GoogleLoginUseCase];
