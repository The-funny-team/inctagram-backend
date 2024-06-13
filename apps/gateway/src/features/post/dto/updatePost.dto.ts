import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString, Matches, ValidateIf } from 'class-validator';
import { ERROR_LENGTH_DESCRIPTION } from '@gateway/src/features/post/post.constants';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Post description, it can be an empty string',
    type: 'string',
    example: 'post_content',
    minLength: 3,
    maxLength: 500,
    pattern: '0-9; A-Z; a-z; _ ; -',
  })
  @Matches('^[a-zA-Z0-9_ -\\s]*$')
  @Length(3, 500, { message: ERROR_LENGTH_DESCRIPTION })
  @IsString()
  @ValidateIf((o) => o.description !== '')
  description: string;
}
