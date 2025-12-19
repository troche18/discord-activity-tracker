import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client'; // 型定義があれば使うと便利

type PaginatedUsers = {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search?: string): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.UserWhereInput = {
      ...(search ? {
        username: {
          contains: search,
          mode: 'insensitive'
        }
      } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { username: 'asc' },
      }),
      this.prisma.user.count({ where: whereCondition }),
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

  async findOne(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId: userId },
    });
  }
}