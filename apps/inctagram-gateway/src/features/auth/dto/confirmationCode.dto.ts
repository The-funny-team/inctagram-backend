import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class ConfirmationCodeDto {
  @ApiProperty({
    description: 'Confirmation code',
    type: 'string',
    example: uuidv4(),
  })
  @IsUUID()
  @IsNotEmpty()
  code: string;
}
