import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalticsDto } from './dto/get-analytics.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';
import * as moment from 'moment';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.Administrator)
  @Get()
  async getAnalytics(@Query() query: GetAnalticsDto) {
    // Default period to 'daily' if not provided
    const period = query.period || 'daily';
    const { dateStart, dateEnd } = query;

    if (period === 'daily') {
      return await this.analyticsService.getDataDaily(dateStart, dateEnd);
    } else if (period === 'monthly') {
      return await this.analyticsService.getDataMonthly(dateStart, dateEnd);
    } else {
      // Optionally handle unexpected period values
      throw new Error('Invalid period value');
    }
  }
}
