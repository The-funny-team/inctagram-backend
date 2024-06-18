import { ApiProperty } from '@nestjs/swagger';

export class ResponseAuthorDto {
  @ApiProperty({ description: 'authorId', type: 'string' })
  id: string;

  @ApiProperty({ description: 'author name', type: 'string' })
  name: string;

  @ApiProperty({
    description: 'author avatar url',
    type: 'string',
    nullable: true,
  })
  avatarUrl: string | null;
}
