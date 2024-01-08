import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOauth2Config {
  constructor(private readonly configService: ConfigService) {}

  getSettings() {
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
