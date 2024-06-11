import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedirectUrlDto {
  @ApiProperty({
    description: 'Redirect url',
    type: 'string',
  })
  @IsString()
  @IsUrl()
  redirectUrl!: string;
}
