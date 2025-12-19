import { Controller, Get, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(
    @Query('userId') userId: string,
    // URLパラメータは文字列で来るため、初期値も文字列で設定します
    @Query('page') page: string = '1',  
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    // ここで Number() を使って数値に変換してから Service に渡します
    return this.activitiesService.findAll(
      userId,
      Number(page), 
      Number(limit), 
      search
    );
  }
}