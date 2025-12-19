import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

type UpdateType = 'activity' | 'status';

/**
 * APIサーバーに更新を通知する関数
 */
export async function notifyUpdate(userId: string, type: UpdateType, details?: any) {
  try {
    await axios.post(`${API_URL}/internal/webhook/update`, {
      userId,
      type,
      timestamp: new Date().toISOString(),
      data: details, // 必要であれば変更内容（ゲーム名など）も送る
    });
    console.log(`📡 Notification sent: ${type} for ${userId}`);
  } catch (error: any) {
    // APIが落ちていてもBot自体は止まらないようにエラーを握りつぶす（ログだけ出す）
    console.error(`❌ Failed to send webhook: ${error.message}`);
  }
}
