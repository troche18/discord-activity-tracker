import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// 1. Prisma（データベース操作ツール）の準備
const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences, // 誰が何をしてるか見る権限
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

// 2. ステータス更新イベント（誰かの状態が変わったらここが動く）
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  // Bot自身の変更は無視
  if (newPresence.user?.bot) return;
  
  // ユーザー情報を取得
  const userId = newPresence.userId;
  const user = newPresence.user;
  const username = user?.username || 'Unknown';

  try {
    // ★ ここに追加: ユーザー情報の更新
    // 「このuserIdの人がいたら名前を最新に更新、いなかったら新規登録」
    await prisma.user.upsert({
      where: {
        userId: userId, // 検索キー (PK)
      },
      update: {
        username: username, // 見つかったら名前を更新
        // updatedAt は @updatedAt があるので自動更新されます
      },
      create: {
        userId: userId,   // 見つからなかったらIDを登録
        username: username, // 名前も登録
      },
    });
  } catch (error) {
    console.error('❌ Failed to upsert user:', error);
    return; // ユーザー登録に失敗したら、ログ保存もできないのでここで終わる
  }

  const oldActivities = oldPresence?.activities || [];
  // 今やっているアクティビティ（ゲームなど）のリストを取得
  const newActivities = newPresence.activities;

  // ★ ここが Issue #1 の核心ロジックになります
  // 「oldにはあったけど、newにはない」= 「終了したアクティビティ」
  const endedActivities = oldActivities.filter(oldAct => {
    // newActivitiesの中に、同じもの(equals)が存在しないなら、それは終わったということ
    return !newActivities.some(newAct => newAct.equals(oldAct));
  });

  if (endedActivities.length > 0) {
    console.log('🛑 Ended Activities:', endedActivities.map(a => a.name));
    // 終了したアクティビティを1つずつ処理する
    for (const activity of endedActivities) {
      // データベースから「閉じられていないログ」を探す
      const activeLog = await prisma.activityLog.findFirst({
        where: {
          userId: userId,
          activityName: activity.name,
          endTime: null,
        },
        orderBy: {
          // 万が一複数あっても、一番新しいやつを拾う
          startTime: 'desc',
        },
      });

      // 見つかったら終了時間を書き込む
      if (activeLog) {
        await prisma.activityLog.update({
          where: {
            id: activeLog.id,
          },
          data: {
            endTime: new Date(),
          },
        });
        console.log(`⏹️ Log closed: ${activity.name}`);
      }
    }
  }

  // 開始判定も同じロジックで行う
  const startedActivities = newActivities.filter(newAct => {
    return !oldActivities.some(oldAct => oldAct.equals(newAct));
  });

  for (const activity of startedActivities) {
    // 例: "Visual Studio Code" や "Apex Legends" などの名前
    const activityName = activity.name;

    console.log(`🎮 [Activity Detected] ${username}: ${activityName}`);

    try {
      // 3. データベースに保存 (INSERT)
      await prisma.activityLog.create({
        data: {
          userId: userId,
          activityName: activityName,
          // startTimeはデフォルトで現在時刻が入ります
        },
      });
      console.log(`💾 Saved to DB: ${activityName}`);
    } catch (error) {
      console.error('❌ DB Error:', error);
    }
  }

  const oldStatus = oldPresence?.status || 'offline';
  const newStatus = newPresence.status;

  // ステータスが変わっていなければ何もしない
  if (oldStatus == newStatus) return;

  console.log(`🚦 Status Changed: ${oldStatus} -> ${newStatus}`);

  try {
    const activeStatusLog = await prisma.userStatusLog.findFirst({
      where: {
        userId: userId,
        status: oldStatus, 
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (activeStatusLog) {
      await prisma.userStatusLog.update({
        where: { id: activeStatusLog.id },
        data: { endTime: new Date() },
      });
    }
  } catch (error) {
    console.error('❌ Failed to update status end time:', error);
  }
  
  try {
    await prisma.userStatusLog.create({
      data: {
        userId: userId,
        status: newStatus,
        // startTime は自動
      },
    });
    console.log(`💾 Status Saved: ${newStatus}`);
  } catch (error) {
    console.error('❌ Failed to create status log:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);