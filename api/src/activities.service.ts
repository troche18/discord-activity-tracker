import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ActivityLog } from '@prisma/client'; // 型定義があれば使うと便利

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId? :string): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: userId ? { userId: userId } : {},
      take: 50,
      orderBy: {
        id: 'desc', 
      },
      include: {
        user: true,
      },
    });
  }
}