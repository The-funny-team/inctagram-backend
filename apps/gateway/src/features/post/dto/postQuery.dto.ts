import { IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostQueryDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ description: 'Sorting direction', default: 'desc' })
  sortDirection?: string = 'desc';

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'authorId'])
  @ApiProperty({
    description: 'Sorting item',
    default: 'createdAt',
  })
  sortField?: string = 'createdAt';

  @ApiProperty({ description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number = 0;

  @ApiProperty({ description: 'Number of items to take', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number = 10;
}
