import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class ResponseUserDto {
  @ApiProperty({
    description: 'user ID',
    type: 'string',
    example: uuidv4(),
  })
  id: string;

  @ApiProperty({ description: 'Username', type: 'string' })
  username: string;

  @ApiProperty({ description: 'email', type: 'string' })
  email: string;

  @ApiProperty({ description: 'First name', type: 'string' })
  firstName: string;

  @ApiProperty({ description: 'Last name', type: 'string' })
  lastName: string;

  @ApiProperty({
    description: 'Date of birth',
    type: 'string',
    example: new Date().toISOString(),
  })
  dateOfBirth: string;

  @ApiProperty({ description: 'Country', type: 'string' })
  country: string;

  @ApiProperty({ description: 'City', type: 'string' })
  city: string;

  @ApiProperty({
    description: 'creation date',
    type: 'string',
    example: new Date().toISOString(),
  })
  createdAt: string;

  @ApiProperty({
    description: 'update date',
    type: 'string',
    example: new Date().toISOString(),
  })
  updatedAt: string;

  @ApiProperty({
    description: 'About me',
    type: 'string',
  })
  aboutMe: string;

  @ApiProperty({
    description: 'Avatar file url',
    type: 'string',
  })
  avatarUrl: string;

  static getView(user: User, avatarUrl?: string): ResponseUserDto {
    return {
      id: user.id,
      username: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      country: user.country,
      city: user.city,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      aboutMe: user.aboutMe,
      avatarUrl: avatarUrl ? avatarUrl : null,
    };
  }
}
