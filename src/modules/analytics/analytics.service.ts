import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyAnalytics } from './entities/daily-analytics.entity';
import { LessThan, MoreThan, Raw, Repository } from 'typeorm';
import { MonthlyAnalytics } from './entities/monthly-analytics.entity';
import * as moment from 'moment';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(DailyAnalytics)
    private dailyAnalyticsRepository: Repository<DailyAnalytics>,
    @InjectRepository(MonthlyAnalytics)
    private monthlyAnalyticsRepository: Repository<MonthlyAnalytics>,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  private getValidDateRange(dateStart: string, dateEnd: string): { dateStart: Date, dateEnd: Date } {
    const start = moment(dateStart);
    const end = moment(dateEnd);
  
    if (end.isBefore(start)) {
      return { dateStart: end.startOf('day').toDate(), dateEnd: start.endOf('day').toDate() };
    }
  
    return { dateStart: start.startOf('day').toDate(), dateEnd: end.endOf('day').toDate() };
  }

  async insertDataDaily(
    activeUser: number,
    conversation: number,
  ): Promise<DailyAnalytics> {
    try {
      const value = { activeUser, conversation };
      const newData = this.dailyAnalyticsRepository.create({
        ...value,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return this.dailyAnalyticsRepository.save(newData);
    } catch (error) {
      this.logger.log({ meesage: 'Insert Daily Error', error });
      throw new Error('Something went wrong');
    }
  }

  async insertDataMonthly(): Promise<DailyAnalytics> {
    try {
      const dateStart = moment().subtract(1, 'month').startOf('month').toDate();
      const dateEnd = moment().subtract(1, 'month').endOf('month').toDate();

      // Calculate the totals
      const result = await this.dailyAnalyticsRepository
        .createQueryBuilder('daily_analytics')
        .select('SUM(daily_analytics.activeUser)', 'totalActiveUser')
        .addSelect('SUM(daily_analytics.conversation)', 'totalConversation')
        .where('daily_analytics.created_at BETWEEN :dateStart AND :dateEnd', {
          dateStart,
          dateEnd,
        })
        .getRawOne();

      const monthlyAnalytics = this.monthlyAnalyticsRepository.create({
        activeUser: result.totalActiveUser ? parseInt(result.totalActiveUser, 10) : 0,
        conversation: result.totalActiveUser ? parseInt(result.totalConversation, 10): 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return this.monthlyAnalyticsRepository.save(monthlyAnalytics);
    } catch (error) {
      this.logger.log({ meesage: 'Insert Monthly Error', error });
      throw new Error('Something went wrong');
    }
  }

  async getDataDaily(dateStart: string, dateEnd: string) {
    try {

      const { dateStart: validDateStart, dateEnd: validDateEnd } = this.getValidDateRange(dateStart, dateEnd);

      const data = await this.dailyAnalyticsRepository
        .createQueryBuilder('daily_analytics')
        .where('daily_analytics.created_at >= :dateStart', { dateStart: validDateStart })
        .andWhere('daily_analytics.created_at <= :dateEnd', { dateEnd: validDateEnd })
        .getMany();

      return { data };
    } catch (error) {
      this.logger.log({ meesage: 'Get Analytics Daily Error', error });
      throw new Error('Something went wrong');
    }
  }

  async getDataMonthly(dateStart: string, dateEnd: string) {
    try {
      const { dateStart: validDateStart, dateEnd: validDateEnd } = this.getValidDateRange(dateStart, dateEnd);

      const data = await this.monthlyAnalyticsRepository
        .createQueryBuilder('monthly_analytics')
        .where('monthly_analytics.created_at >= :dateStart', { dateStart: validDateStart })
        .andWhere('monthly_analytics.created_at <= :dateEnd', { dateEnd: validDateEnd })
        .getMany();


      return { data };
    } catch (error) {
      this.logger.log({ meesage: 'Get Analytics Monthly Error', error });
      throw new Error('Something went wrong');
    }
  }

  // cron

  // @Cron(CronExpression.EVERY_SECOND) // Runs at midnight every day

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs at midnight every day
  async handleCronDaily() {
    const currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD');

    // Get the number of unique active users
    const activeUser = await this.redisService.scard(
      `chat_users:${currentDate}`,
    );

    // Get the keys for conversations
    const conversationData = await this.redisService.get(
      `conversation_${currentDate}`,
    );
    const conversation = parseInt(conversationData ?? '0', 10);

    // Create and save the daily analytics record
    await this.insertDataDaily(activeUser, conversation);

    console.log(`Daily analytics for ${currentDate} created.`);
  }

  @Cron('0 0 1 * *') // Runs at midnight on the first day of every month
  // @Cron(CronExpression.EVERY_SECOND) // Runs at midnight every day
  async handleCronMonthly() {
    await this.insertDataMonthly();
  }
}
