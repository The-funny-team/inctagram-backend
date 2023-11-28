import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  validate,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class LoginDto {
  constructor(email, password) {
    this.password = password;
    this.email = email;
  }

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Length(3, 50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  password: string;

  async validate() {
    const errors = await validate(this);
    if (errors.length > 0)
      throw new BadRequestException(
        errors.map((e) => ({
          message: Object.values(e.constraints!)[0],
          field: e.property,
        })),
      );
    console.log('validate login dto errors:', errors);
    return;
  }
}
