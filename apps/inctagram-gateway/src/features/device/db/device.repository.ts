import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { CreateDeviceType } from '../types/createDevice.type';

@Injectable()
export class DeviceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(deviceDto: CreateDeviceType): Promise<void> {
    await this.prismaService.device.create({
      data: {
        id: deviceDto.id,
        ip: deviceDto.ip,
        title: deviceDto.title,
        userId: deviceDto.userId,
        lastActiveDate: deviceDto.lastActiveDate,
        expirationDate: deviceDto.expirationDate,
      },
    });
    return;
  }

  async deleteDevicesByUserId(userId: string) {
    await this.prismaService.device.deleteMany({ where: { userId } });
  }
}
