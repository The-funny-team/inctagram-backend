import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InternalServerError } from '../exceptions';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    if (!request.user || !request.user.userId)
      throw new InternalServerError('Haven`t userId in request');
    return request.user.userId;
  },
);
