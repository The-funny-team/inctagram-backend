import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const getClientFileServiceConfig = (): ClientsProviderAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host:
          configService.get('FILE_SERVICE_HOST') ||
          'ft-inctagram-upload-files-service',
        port: Number(configService.get('FILE_SERVICE_PORT')) || 3296,
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
    name: 'FILE_SERVICE',
  };
};
