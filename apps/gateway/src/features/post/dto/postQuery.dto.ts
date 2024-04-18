import { IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostQueryDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ description: 'Sorting direction', default: 'asc' })
  sortDirection?: string = 'asc';

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'authorId'])
  @ApiProperty({
    description: 'Sorting item',
    default: 'createdAt',
  })
  sortField?: string = 'createdAt';

  @IsOptional()
  @ApiProperty({ description: 'Number of items to skip', default: 0 })
  skip?: number = 0;

  @IsOptional()
  @ApiProperty({ description: 'Number of items to take', default: undefined })
  take?: number = undefined;
}
