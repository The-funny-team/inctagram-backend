import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger/swaggerSetup';
import cookieParser from 'cookie-parser';
import { pipesSetup } from './pipes/pipesSetup';
import { AppModule } from '../../app.module';
import { useContainer } from 'class-validator';
import { filterSetup } from './filters';
import { APP_GLOBAL_PREFIX } from './config.constants';

export function configApp(app: INestApplication) {
  app.setGlobalPrefix(APP_GLOBAL_PREFIX);
  app.use(cookieParser());
  app.enableCors({ credentials: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  pipesSetup(app);
  filterSetup(app);
  swaggerSetup(app);
}
