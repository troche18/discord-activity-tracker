// api/src/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // アプリ起動時にDBへ接続
  async onModuleInit() {
    await this.$connect();
  }

  // アプリ終了時にDB接続を切断
  async onModuleDestroy() {
    await this.$disconnect();
  }
}