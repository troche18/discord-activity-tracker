// api/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  // コンストラクタでPrismaServiceを受け取る（依存性の注入）
  constructor(private readonly prisma: PrismaService) {}

  // 1. トップページ (http://localhost:3000)
  @Get()
  getHello(): string {
    return 'Hello! This is Discord Activity Tracker API.';
  }

  // 2. アクティビティ履歴の取得 (http://localhost:3000/activities)
  @Get('activities')
  async getActivities() {
    // DBから「ActivityLog」テーブルのデータを全件取得
    const logs = await this.prisma.activityLog.findMany({
      orderBy: {
        startTime: 'desc', // 新しい順に並び替え
      },
      take: 50, // (任意) データが増えすぎないよう最新50件だけにする
      include: {
        user: true,
      }
    });
    return logs;
  }

  // 3. ステータス履歴の取得 (http://localhost:3000/status)
  @Get('status')
  async getStatusLogs() {
    const logs = await this.prisma.userStatusLog.findMany({
      orderBy: {
        startTime: 'desc',
      },
      take: 50,
      include: {
        user: true,
      }
    });
    return logs;
  }
}