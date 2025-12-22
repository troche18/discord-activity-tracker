import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserStatusLog, ActivityLog, Prisma } from '@prisma/client'; // ★ Prisma を追加

export type WeeklyLogItem<T> = T & {
  displayStartTime: Date; 
  displayEndTime: Date | null;
  isFuzzyStart: boolean;
  isFuzzyEnd: boolean;
};

type DayTimeline = {
  date: string;
  dayOfWeek: string;
  activities: WeeklyLogItem<ActivityLog>[];
  statuses: WeeklyLogItem<UserStatusLog>[];
};

type WeeklyTimeline = {
  startDate: string;
  days: DayTimeline[];
};

const dayOfWeekSeq = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

@Injectable()
export class WeeklyTimelineService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, startDateStr: string): Promise<WeeklyTimeline> {
    const rangeStart = new Date(startDateStr);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    const whereBase = {
      userId: userId,
      startTime: { lt: rangeEnd }, // 開始時間が期間終了より前
      OR: [
        { endTime: { gte: rangeStart } }, // 終了時間が期間開始より後
        { endTime: null },                // または、終わっていない
      ],
    };

    const [weekStatuses, weekActivities] = await this.prisma.$transaction([
      this.prisma.userStatusLog.findMany({
        where: whereBase,
        orderBy: { id: 'asc' },
        include: { user: true },
      }),
      this.prisma.activityLog.findMany({
        where: whereBase,
        orderBy: { id: 'asc' },
        include: { user: true },
      }),
    ]);

    const days: DayTimeline[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDayStart = new Date(rangeStart);
      currentDayStart.setDate(currentDayStart.getDate() + i);

      const currentDayEnd = new Date(currentDayStart);
      currentDayEnd.setDate(currentDayStart.getDate() + 1);

      const dateStr = currentDayStart.toISOString().split('T')[0];
      const dayOfWeek = dayOfWeekSeq[currentDayStart.getDay()];

      const processLogs = <T extends { startTime: Date; endTime: Date | null }>(logs: T[]): WeeklyLogItem<T>[] => {
        return logs
          .filter(log => {
            // A. ログの開始が、今日の終わりより前
            // B. ログの終了が、今日の始まりより後 (または未終了)
            const logEnd = log.endTime ?? new Date(); // 未終了なら現在時刻(未来)扱い
            return log.startTime < currentDayEnd && logEnd > currentDayStart;
          })
          .map(log => {
            const isFuzzyStart = log.startTime < currentDayStart;
            const isFuzzyEnd = log.endTime === null || log.endTime > currentDayEnd;

            // 表示用の時間をクリッピング（その日の範囲内に収める）
            const displayStartTime = isFuzzyStart ? currentDayStart : log.startTime;
            
            let displayEndTime: Date | null = log.endTime;
            if (isFuzzyEnd) {
              // 継続中、または翌日に続く場合は、今日の終わりを表示上の終了とする
              displayEndTime = currentDayEnd; 
            }

            return {
              ...log,
              displayStartTime,
              displayEndTime,
              isFuzzyStart,
              isFuzzyEnd,
            };
          });
      };

      days.push({
        date: dateStr,
        dayOfWeek,
        activities: processLogs(weekActivities),
        statuses: processLogs(weekStatuses),
      });
    }

    return {
      startDate: startDateStr,
      days,
    };
  }
}