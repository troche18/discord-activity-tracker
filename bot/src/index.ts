import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { notifyUpdate } from './utils/apiClient';
import dotenv from 'dotenv';

dotenv.config();

const sendNotification = (userId: string, type: 'activity' | 'status', data: any) => {
  notifyUpdate(userId, type, data).catch(err => console.error('Failed to notify API:', err));
};

// 1. Prisma（データベース操作ツール）の準備
const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences, // 誰が何をしてるか見る権限
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  const activeLogs = await prisma.activityLog.findMany({
    where: {
      endTime: null,
    },
  });

  const keptActivities = new Set<string>();

  for (const log of activeLogs) {
    // Botが参加している全サーバーから、そのユーザーを探す
    // (findを使うと、見つかった時点でループが終わるので効率的)
    const member = client.guilds.cache
      .map(guild => guild.members.cache.get(log.userId))
      .find(m => m !== undefined);

    // もしメンバーが見つからない（サーバーから抜けた等）場合は、
    // 継続確認できないので「終了」扱いにするのが安全
    if (!member || !member.presence) {
      await prisma.activityLog.update({
        where: { id: log.id },
        data: { 
          endTime: new Date(),     // 時間はとりあえず「再起動時刻」を入れる（時系列を壊さないため）
          isUnexpectedEnd: true    // ★フラグを立てる（＝「実は不明です」の合図）
        },
      });
      continue;
    }
    
    // ユーザーの現在のアクティビティリスト
    const currentActivities = member.presence.activities;

    // 判定ロジック
    const isSessionContinuing = currentActivities.some(activity => {
      // 1. 名前が一致するか？
      const isSameName = activity.name === log.activityName;
      
      // 2. 開始時間が一致するか？
      // Discord側の開始時間があるかチェック
      const discordStartTime = activity.timestamps?.start;
      
      let isSameTime = false;
      if (discordStartTime) {
        // DBの時間と、Discordの時間の「ズレ」を計算
        const diff = Math.abs(discordStartTime.getTime() - log.startTime.getTime());
        
        // ズレが 2000ミリ秒 (2秒) 未満なら「同じ」とみなす
        // (通信ラグなどで完全に一致しないことがあるため、少し許容する)
        isSameTime = diff < 2000;
      }

      // 名前が同じで、かつ (時間が記録されてない OR 時間も同じ) なら「継続」とみなす
      // ※Discord側で時間が出ないゲームもあるため、discordStartTimeがない場合は名前一致だけでOKとする手もある
      // ※今回のIssueの目的は「厳密なチェック」なので、以下のようにするのがベスト
      if (discordStartTime) {
        return isSameName && isSameTime;
      } else {
        return false;
      }
    });

    if (isSessionContinuing) {
      console.log(`✅ Session continued: ${log.activityName} (${member.user.username})`);
      keptActivities.add(`${log.userId}:${log.activityName}`);
    } else {
      console.log(`🛑 Session ended during downtime: ${log.activityName} (${member.user.username})`);
      await prisma.activityLog.update({
        where: { id: log.id },
        data: { 
          endTime: new Date(),     // 時間はとりあえず「再起動時刻」を入れる（時系列を壊さないため）
          isUnexpectedEnd: true    // ★フラグを立てる（＝「実は不明です」の合図）
        },
      });
    }
  }

  const activeStatusLogs = await prisma.userStatusLog.findMany({
    where: { endTime: null },
  });

  for (const log of activeStatusLogs) {
    const member = client.guilds.cache
      .map(guild => guild.members.cache.get(log.userId))
      .find(m => m !== undefined);
    
    // メンバーが見つからない、または情報が取れない場合は、現在のステータスは 'offline' とみなす
    const currentStatus = member?.presence?.status || 'offline';

    console.log(`[Status] Closed zombie status: ${log.status} -> ${currentStatus} (${log.userId})`);
    await prisma.userStatusLog.update({
      where: { id: log.id },
      data: { endTime: new Date(), isUnexpectedEnd: true },
    });
  }

  // ---------------------------------------------------------
  // 2. 現在の状態の新規登録 (Initialization)
  // ---------------------------------------------------------
  // 全サーバーの全メンバーをスキャンして、未登録のアクティビティがあれば登録する
  for (const guild of client.guilds.cache.values()) {
    for (const member of guild.members.cache.values()) {
      if (member.user.bot) continue;

      const userId = member.id;
      const username = member.user.username;

      // User情報の更新 (念のため)
      try {
        await prisma.user.upsert({
          where: { userId: userId },
          update: { username: username },
          create: { userId: userId, username: username },
        });
      } catch (e) { /* 無視 */ }

      // アクティビティの登録
      if (member.presence) {
        for (const activity of member.presence.activities) {
          const key = `${userId}:${activity.name}`;
          
          // さっき「継続」と判定されたやつはスキップ (二重登録防止)
          if (keptActivities.has(key)) continue;

          console.log(`🆕 Found new activity on startup: ${activity.name} (${username})`);
          
          // 開始時間を決定 (Discordの記録があればそれを使う、なければ現在時刻)
          const startTime = activity.timestamps?.start || new Date();

          try {
            await prisma.activityLog.create({
              data: {
                userId: userId,
                activityName: activity.name,
                startTime: startTime,
              },
            });
            sendNotification(userId, 'activity', { name: activity.name });
          } catch (error) {
            console.error('❌ DB Error (Startup):', error);
          }
        }
      }

      const currentStatus = member.presence?.status || 'offline';

      console.log(`🆕 Found new status on startup: ${currentStatus} (${username})`);

      try {
        await prisma.userStatusLog.create({
          data: {
            userId: userId,
            status: currentStatus,
            // startTimeは現在時刻になる（APIから過去の時間は取れないため）
            startTime: new Date(),
          }
        });
        sendNotification(userId, 'status', { status: currentStatus});
      } catch (error) {
        console.error('❌ DB Error (Status Startup):', error);
      }
    }
  }
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
        sendNotification(newPresence.userId, 'activity', { name: activity.name });
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
          startTime: activity.timestamps?.start || new Date(),
        },
      });
      console.log(`💾 Saved to DB: ${activityName}`);
      sendNotification(newPresence.userId, 'activity', { name: activityName });
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
    sendNotification(newPresence.userId, 'status', { status: newPresence.status });
  } catch (error) {
    console.error('❌ Failed to create status log:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);