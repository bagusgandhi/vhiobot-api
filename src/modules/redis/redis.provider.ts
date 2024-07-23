import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { Env } from 'src/config/env-loader';

const { REDIS_HOST, REDIS_PORT } = Env();

export type RedisClient = Redis;

export const redisProvider: Provider = {
  useFactory: (): RedisClient => {
    return new Redis({
      host: REDIS_HOST || 'localhost',
      port: REDIS_PORT || 6379,
    });
  },
  provide: 'REDIS_CLIENT',
};