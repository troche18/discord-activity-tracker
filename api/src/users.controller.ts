import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      Number(page),
      Number(limit),
      search
    );
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}