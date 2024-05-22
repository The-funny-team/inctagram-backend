import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  npm_package_version: string;
  GLOBAL_PREFIX: string;
  RMQ_URLS: string;
}

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  get isDev(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }

  get port(): number {
    return this.configService.get<number>('PORT', { infer: true }) || 3001;
  }

  get appVersion(): string | null {
    return this.configService.get('npm_package_version') ?? null;
  }

  get globalPrefix(): string {
    return this.configService.get('GLOBAL_PREFIX', 'api/v1');
  }

  get rmqUrls(): string[] {
    return this.configService.get('RMQ_URLS')?.split(', ') ?? [];
  }
}
