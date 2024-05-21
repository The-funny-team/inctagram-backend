import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_GLOBAL_PREFIX } from '../config.constants';
import { ConfigService } from '@nestjs/config';

const generateSwaggerDescription = () => `The intagram API description 
<p>
Download OpenAPI specification: <a href="https://funny-inctagram.site/api/v1/doc-json">swagger.json</a>
</p>`;

export function swaggerSetup(app: INestApplication) {
  const configService = app.get<ConfigService>(ConfigService);

  const config = new DocumentBuilder()
    .addCookieAuth('refreshToken')
    .setTitle('Intagram backend')
    .setDescription(generateSwaggerDescription())
    .setVersion(configService.get('npm_package_version') ?? '1.0')
    .addCookieAuth(
      'refreshToken',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token for user',
      },
      'refreshToken',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme.',
        in: 'header',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${APP_GLOBAL_PREFIX}/doc`, app, document);
}
