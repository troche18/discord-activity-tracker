// web/src/app/users/[userId]/status/page.tsx

import Link from 'next/link';

// 1. 型定義
type UserStatusLog = {
  id: number;
  user: {
    username: string;
    userId: string;
  }
  status: string;
  startTime: string;
  endTime: string | null;
  isUnexpectedEnd: boolean;
  createdAt: string;
};

// 2. データ取得関数 (userIdで絞り込み)
async function getUserStatusLogs(userId: string): Promise<UserStatusLog[]> {
  const res = await fetch(`http://localhost:3000/status?userId=${userId}`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

// 3. ステータスの色を決めるヘルパー関数
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'idle':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dnd':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'offline':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default async function UserStatusPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  const logs = await getUserStatusLogs(userId);
  const username = logs.length > 0 ? logs[0].user.username : `ID: ${userId}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション: Dashboardに戻る */}
        <div className="mb-6">
          <Link href={`/users/${userId}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            ← Back to Dashboard
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
            🚦
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {username}'s Status History
          </h1>
        </div>

        {/* テーブル */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border capitalize ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.startTime).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.endTime ? (
                      log.isUnexpectedEnd ? 
                        <span className="text-red-600 font-bold">⚠️ Unknown</span> : 
                        <span className="text-gray-400">Changed</span>
                    ) : (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Current
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              ステータスログがありません
            </div>
          )}
        </div>
      </div>
    </main>
  );
}