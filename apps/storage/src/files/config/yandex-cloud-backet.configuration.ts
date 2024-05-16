import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AmazonCloudBacketConfig {
  constructor(protected configService: ConfigService) {}

  getSettings() {
    return {
      AMAZON_CLOUD_BUCKET_NAME:
        this.configService.get<string>('AMAZON_CLOUD_BUCKET_NAME') ?? '',
      AMAZON_CLOUD_KEY_ID:
        this.configService.get<string>('AMAZON_CLOUD_KEY_ID') ?? '',
      AMAZON_CLOUD_SECRET_KEY:
        this.configService.get<string>('AMAZON_CLOUD_SECRET_KEY') ?? '',
      AMAZON_CLOUD_URL:
        this.configService.get<string>('AMAZON_CLOUD_URL') ?? '',
      AMAZON_CLOUD_URL_FILES:
        this.configService.get<string>('AMAZON_CLOUD_URL_FILES') ?? '',
    };
  }
}
