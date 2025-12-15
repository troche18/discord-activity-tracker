import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserStatusLog } from '@prisma/client'; // 型定義があれば使うと便利

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string): Promise<UserStatusLog[]> {
    return this.prisma.userStatusLog.findMany({
      where: userId ? { userId: userId } : {},
      take: 100,
      orderBy: {
        id: 'desc', 
      },
      include: {
        user: true,
      },
    });
  }
}