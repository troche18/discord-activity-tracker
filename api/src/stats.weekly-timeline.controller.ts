import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { WeeklyTimelineService } from './stats.weekly-timeline.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly weeklyTimelineService: WeeklyTimelineService) {}

  @Get('weekly-timeline')
  async getWeeklyTimeline(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!startDate) {
      throw new BadRequestException('startDate is required (format: YYYY-MM-DD)');
    }

    // 簡単な日付形式チェック（YYYY-MM-DD）
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new BadRequestException('startDate must be in YYYY-MM-DD format');
    }

    return this.weeklyTimelineService.findAll(userId, startDate);
  }
}