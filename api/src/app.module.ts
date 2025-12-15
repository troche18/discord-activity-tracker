import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    UsersController,
    ActivitiesController,
    StatusController
  ],
  providers: [
    AppService,
    PrismaService,
    UsersService,
    ActivitiesService,
    StatusService
  ],
})
export class AppModule {}
