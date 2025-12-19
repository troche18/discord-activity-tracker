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
}