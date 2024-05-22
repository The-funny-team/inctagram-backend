import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class PasswordRecoveryResendingDto {
  @ApiProperty({
    description: 'Old recovery password code',
    type: 'string',
    example: uuidv4(),
  })
  @IsUUID()
  @IsNotEmpty()
  code: string;
}
