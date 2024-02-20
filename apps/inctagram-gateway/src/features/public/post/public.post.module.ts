import { Module } from '@nestjs/common';
import { PublicPostController } from './api/public.post.controller';

@Module({
  controllers: [PublicPostController],
})
export class PublicPostModule {}
