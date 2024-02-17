import { ApiProperty } from '@nestjs/swagger';
import { ERROR_FORMAT_EMAIL } from '../user.constants';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserPasswordRecoveryDto {
  @ApiProperty({
    description: 'email',
    type: 'string',
    example: 'test@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: ERROR_FORMAT_EMAIL,
    },
  )
  @IsString()
  @IsNotEmpty()
  email: string;
}
