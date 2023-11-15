import { Module } from '@nestjs/common';
import { PrismaService } from './core';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

console.log('db url:', process.env.DATABASE_URL);
