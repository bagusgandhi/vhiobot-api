import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Env } from 'src/config/env-loader';

const { PORT } = Env();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.enableCors();

  await app.listen(PORT || 3009, () => {
    Logger.debug(`server runnning at port 3009`);
  });
}
bootstrap();
