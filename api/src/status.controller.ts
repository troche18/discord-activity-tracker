import { Controller, Get, Query } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async findAll(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    return this.statusService.findAll(
      userId,
      Number(page),
      Number(limit),
      search
    );
  }
}