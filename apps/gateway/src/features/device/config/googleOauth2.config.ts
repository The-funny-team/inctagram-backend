import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GoogleOauth2Settings {
  redirectUri?: string;
  clientId?: string;
  accessTokenURL: string;
  clientSecret?: string;
  grantType: string;
  rootURl?: string;
}

@Injectable()
export class GoogleOauth2Config {
  constructor(private readonly configService: ConfigService) {}

  getSettings(): GoogleOauth2Settings {
    return {
      rootURl: 'https://oauth2.googleapis.com/token',
      accessTokenURL: 'https://www.googleapis.com/oauth2/v1/userinfo',
      clientId: this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.configService.get<string>(
        'GOOGLE_OAUTH_CLIENT_SECRET',
      ),
      redirectUri: this.configService.get<string>('GOOGLE_OAUTH_REDIRECT'),
      grantType: 'authorization_code',
    };
  }
}
