import { IsOptional, IsIn, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostQueryDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ description: 'Sorting direction', default: 'asc' })
  sortDirection?: string;

  @IsOptional()
  @IsIn(['createdAt', 'title', 'author'])
  @ApiProperty({
    description: 'Sorting item',
    default: ['createdAt', 'updatedAt'],
  })
  sortField?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'Number of items to skip', default: 0 })
  skip?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'Number of items to take', default: 10 })
  take?: number;
}
