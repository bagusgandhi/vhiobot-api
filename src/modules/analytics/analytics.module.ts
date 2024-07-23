import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { RedisModule } from '../redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyAnalytics } from './entities/daily-analytics.entity';
import { MonthlyAnalytics } from './entities/monthly-analytics.entity';

@Module({
  imports : [TypeOrmModule.forFeature([DailyAnalytics, MonthlyAnalytics]), RedisModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
