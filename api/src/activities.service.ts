import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ActivityLog, Prisma } from '@prisma/client'; // 型定義があれば使うと便利

type PaginatedActivityLogs = {
  data: ActivityLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, page: number, limit: number, search?: string): Promise<PaginatedActivityLogs> {
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.ActivityLogWhereInput = {
      userId: userId,
      ...(search ? {
        activityName: {
          contains: search,
          mode: 'insensitive'
        }
      } : {}),
    };
    
    const [data, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { user: true },
      }),
      this.prisma.activityLog.count({ where: whereCondition }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}