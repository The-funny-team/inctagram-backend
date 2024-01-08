import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class GitHubLoginDto {
  @ApiProperty({
    description: 'GitHub login code',
    type: 'string',
    example: '',
  })
  @IsUUID()
  @IsNotEmpty()
  code: string;
}
