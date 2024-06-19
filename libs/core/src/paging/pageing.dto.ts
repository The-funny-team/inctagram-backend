import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export interface PageMetaDtoParameters<T, TOptions extends { take: number }> {
  data: T;
  options: TOptions;
  totalCount: number;
}

export abstract class PageAbstractDto<
  T,
  TOptions extends { take: number; skip: number },
> {
  @ApiProperty({
    description: 'Page number',
    example: 1,
  })
  readonly page: number;

  @ApiProperty({
    description: 'Page size',
    example: 10,
  })
  readonly pageSize: number;

  @ApiProperty({
    description: 'Total count',
    example: 100,
  })
  readonly totalCount: number;

  @ApiProperty({
    description: 'Pages count',
    example: 10,
  })
  readonly pagesCount: number;

  @ApiProperty({
    description: 'Has previous page',
    example: true,
  })
  readonly hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Has next page',
    example: true,
  })
  readonly hasNextPage: boolean;

  @IsArray()
  abstract data: T;

  constructor({
    // data,
    options,
    totalCount,
  }: PageMetaDtoParameters<T, TOptions>) {
    this.page = Math.floor(options.skip / options.take + 1);
    this.pageSize = options.take;
    this.totalCount = totalCount;
    this.pagesCount = Math.ceil(this.totalCount / this.pageSize);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pagesCount;
  }
}

export class PageDto<
  T,
  TOptions extends { take: number; skip: number },
> extends PageAbstractDto<T, TOptions> {
  // @ApiProperty()
  // readonly page: number;
  //
  // @ApiProperty()
  // readonly pageSize: number;
  //
  // @ApiProperty()
  // readonly totalCount: number;
  //
  // @ApiProperty()
  // readonly pagesCount: number;
  //
  // // readonly hasPreviousPage: boolean;
  //
  // // readonly hasNextPage: boolean;

  @IsArray()
  readonly data: T;

  constructor({
    data,
    options,
    totalCount,
  }: PageMetaDtoParameters<T, TOptions>) {
    super({ data, options, totalCount });

    // this.page = Math.floor(options.skip / options.take + 1);
    // this.pageSize = options.take;
    // this.totalCount = totalCount;
    // this.pagesCount = Math.ceil(this.totalCount / this.pageSize);
    // this.hasPreviousPage = this.page > 1;
    // this.hasNextPage = this.page < this.pagesCount;

    this.data = data;
  }
}
