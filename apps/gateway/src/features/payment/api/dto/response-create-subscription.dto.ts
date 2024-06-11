import { ApiProperty } from '@nestjs/swagger';

export class ResponseCreateSubscriptionDto {
  @ApiProperty({
    description: 'Payment subscription url',
    type: 'string',
  })
  url: string | null;
}
