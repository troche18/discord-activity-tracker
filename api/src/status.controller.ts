import { Controller, Get, Query } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.statusService.findAll(userId);
  }
}