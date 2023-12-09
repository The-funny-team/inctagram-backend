import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { CreateDeviceType } from '../types';
import { Device } from '@prisma/client';

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

  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<Device | null> {
    return this.prismaService.device.findFirst({
      where: {
        userId,
        id: deviceId,
      },
    });
  }

  async findById(id: string): Promise<Device | null> {
    return this.prismaService.device.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaService.device.delete({
      where: {
        id,
      },
    });
    return;
  }

  async deleteDevicesByUserId(userId: string) {
    await this.prismaService.device.deleteMany({ where: { userId } });
  }
}
