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

  // 今やっているアクティビティ（ゲームなど）のリストを取得
  const activities = newPresence.activities;

  // 何もしていなければ終了
  if (activities.length === 0) return;

  // 全てのアクティビティをループして保存
  for (const activity of activities) {
    // 例: "Visual Studio Code" や "Apex Legends" などの名前
    const activityName = activity.name;

    console.log(`🎮 [Activity Detected] ${username}: ${activityName}`);

    try {
      // 3. データベースに保存 (INSERT)
      await prisma.activityLog.create({
        data: {
          userId: userId,
          username: username,
          activityName: activityName,
          // startTimeはデフォルトで現在時刻が入ります
        },
      });
      console.log(`💾 Saved to DB: ${activityName}`);
    } catch (error) {
      console.error('❌ DB Error:', error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);