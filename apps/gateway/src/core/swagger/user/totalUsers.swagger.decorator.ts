import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ResponseGetTotalUsersDto } from '@gateway/src/features/user/responses/responseGetTotalUsers.dto';

export function TotalUsersSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get total users',
    }),
    ApiOkResponse({
      type: ResponseGetTotalUsersDto,
    }),
  );
}
