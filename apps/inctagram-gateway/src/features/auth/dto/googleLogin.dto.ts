import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google login code',
    type: 'string',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
