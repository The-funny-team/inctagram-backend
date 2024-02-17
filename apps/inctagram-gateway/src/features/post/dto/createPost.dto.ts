import { ApiProperty } from '@nestjs/swagger';
import {
  Matches,
  Length,
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ERROR_LENGTH_DESCRIPTION } from '../post.constants';

export class CreatePostDto {
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  images: string[];

  @ApiProperty({
    description: 'Post description',
    type: 'string',
    example: 'post_content',
    minLength: 3,
    maxLength: 500,
    pattern: '0-9; A-Z; a-z; _ ; -',
  })
  @Matches('^[a-zA-Z0-9_-\\s]*$')
  @Length(3, 500, { message: ERROR_LENGTH_DESCRIPTION })
  @IsString()
  @IsNotEmpty()
  description: string;
}
