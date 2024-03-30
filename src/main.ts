import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(parseInt(process.env.PORT), () => {
    Logger.debug(`server runnning at port ${process.env.PORT}`);
  });
}
bootstrap();
