import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetTotalUsersDto {
  @ApiProperty({ description: 'Total users', type: 'number' })
  totalCount: number;
}
