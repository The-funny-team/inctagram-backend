import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Validate,
} from 'class-validator';
import {
  IsPasswordMustContain,
  IsPasswordsMatchingConstraint,
} from '../decorators';
import { ERROR_LENGTH_PASSWORD } from '../user.constants';
import { v4 as uuidv4 } from 'uuid';

export class NewPasswordDto {
  @ApiProperty({
    description: 'new password',
    type: 'string',
    example: 'new_testA0!',
    minLength: 6,
    maxLength: 20,
    pattern: `0-9; A-Z; a-z;
                  !"#$%& '()*+,-./:;<=>? @ [\]^
                  _\` \{ \| \} ~`,
  })
  @Validate(IsPasswordMustContain)
  @Length(6, 20, { message: ERROR_LENGTH_PASSWORD })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    type: 'string',
    example: 'new_testA0!',
    minLength: 6,
    maxLength: 20,
    pattern: `0-9; A-Z; a-z;
            !"#$%& '()*+,-./:;<=>? @ [\]^
            _\` \{ \| \} ~`,
  })
  @Validate(IsPasswordsMatchingConstraint)
  passwordConfirmation: string;

  @ApiProperty({
    description: 'Recovery password code',
    type: 'string',
    example: uuidv4(),
  })
  @IsUUID()
  @IsNotEmpty()
  recoveryCode: string;
}
