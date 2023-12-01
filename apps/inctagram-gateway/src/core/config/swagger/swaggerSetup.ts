import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_GLOBAL_PREFIX } from '../config.constants';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Intagram backend')
    .setDescription('The intagram API description')
    .setVersion('1.0')
    .addTag('Intagram')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${APP_GLOBAL_PREFIX}/doc`, app, document);
}
