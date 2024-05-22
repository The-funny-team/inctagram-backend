import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig {
  constructor(private readonly configService: ConfigService) {}

  get refreshJwtSecret() {
    return this.configService.get<string>('ACCESS_JWT_SECRET')!;
  }

  get accessJwtSecret() {
    return this.configService.get<string>('REFRESH_JWT_SECRET')!;
  }
}
