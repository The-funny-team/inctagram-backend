import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google login code',
    type: 'string',
    example: '',
  })
  @IsUUID()
  @IsNotEmpty()
  code: string;
}
