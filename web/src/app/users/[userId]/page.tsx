import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import DiscordLinkButton from '@/components/DiscordLinkButton';

// ユーザー情報を少しだけ取ってきたいので、最低限のfetchを用意
async function getUser(userId: string) {
  // ユーザー一覧APIからフィルタするか、単一取得APIがあればそれを使う
  const res = await fetch(`http://localhost:3000/users/${userId}`, { cache: 'no-store' });
  
  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function UserDashboard({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  const user = await getUser(userId);
  const username = user ? user.username : `ID: ${userId}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            ← Change User
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {username}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                ID: {userId}
              </span>
              {/* コピーボタン */}
              <CopyButton text={userId} />
              
              {/* ★ Discordリンクボタン */}
              <DiscordLinkButton userId={userId} />
            </div>
            <p className="text-gray-500">User Dashboard</p>
          </div>
        </div>

        {/* メニューグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. アクティビティ履歴へのリンク */}
          <Link href={`/users/${userId}/activities`} className="group">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-blue-400">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
                Activity Logs
              </h2>
              <p className="text-gray-500 mt-2">
                ゲームのプレイ履歴やステータスの変更ログ詳細を確認します。
              </p>
            </div>
          </Link>

          {/* 2. ステータス履歴 (★追加) */}
          <Link href={`/users/${userId}/status`} className="group">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-green-400 h-full">
              <div className="text-4xl mb-4">🚦</div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600">
                Status History
              </h2>
              <p className="text-gray-500 mt-2">
                オンライン・オフラインの切り替え履歴を確認します。
              </p>
            </div>
          </Link>

          {/* 3. 分析 (Coming Soon) - 幅を広げて下に配置 */}
          <div className="md:col-span-2 bg-gray-100 p-8 rounded-xl border border-gray-200 opacity-70 cursor-not-allowed relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs px-2 py-1 rounded">
              Coming Soon
            </div>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-gray-500">
              Analytics
            </h2>
            <p className="text-gray-500 mt-2">
              プレイ時間の統計や傾向をグラフで分析します（実装予定）。
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}