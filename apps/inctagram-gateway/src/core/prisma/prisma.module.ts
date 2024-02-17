import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.servise';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
