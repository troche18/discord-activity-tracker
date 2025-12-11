// web/src/app/page.tsx

// 1. APIから返ってくるデータの形を定義 (Type Definition)
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

// 2. ステータスに応じた色クラスを返すヘルパー関数
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'idle':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dnd': // Do Not Disturb (取り込み中)
      return 'bg-red-100 text-red-800 border-red-200';
    case 'offline':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// 3. データを取得する関数 (Server Side Fetching)
async function getStatusLogs(): Promise<UserStatusLog[]> {
  // APIサーバー(localhost:3000)からデータを取得
  // cache: 'no-store' -> 毎回最新データを取りに行く設定 (SSR)
  const res = await fetch('http://localhost:3000/status', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

// 4. 画面を作るコンポーネント (async functionにするのがポイント)
export default async function Home() {
  const logs = await getStatusLogs();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🚦 Status Log
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border capitalize ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* 日付を見やすく整形 */}
                    {new Date(log.startTime).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.endTime ? (
                      log.isUnexpectedEnd ? '⚠️ Unknown' : <span className="text-gray-400">Changed</span>
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
            <div className="p-6 text-center text-gray-500">
              ログがまだありません
            </div>
          )}
        </div>
      </div>
    </main>
  );
}