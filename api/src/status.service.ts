import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserStatusLog, Prisma } from '@prisma/client'; // ★ Prisma を追加

// レスポンスの型定義
type PaginatedStatusLogs = {
  data: UserStatusLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, page: number, limit: number, search?: string): Promise<PaginatedStatusLogs> {
    const skip = (page - 1) * limit;

    // ★ 検索対象を 'status' カラムに変更
    const whereCondition: Prisma.UserStatusLogWhereInput = {
      userId: userId,
      ...(search ? {
        status: {
          contains: search,
          mode: 'insensitive'
        }
      } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.userStatusLog.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { user: true },
      }),
      this.prisma.userStatusLog.count({ where: whereCondition }),
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