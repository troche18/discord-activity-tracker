// web/src/app/page.tsx

// 1. APIから返ってくるデータの形を定義 (Type Definition)
type ActivityLog = {
  id: number;
  activityName: string;
  status: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
};

// 2. データを取得する関数 (Server Side Fetching)
async function getActivities(): Promise<ActivityLog[]> {
  // APIサーバー(localhost:3000)からデータを取得
  // cache: 'no-store' -> 毎回最新データを取りに行く設定 (SSR)
  const res = await fetch('http://localhost:3000/activities', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

// 3. 画面を作るコンポーネント (async functionにするのがポイント)
export default async function Home() {
  const activities = await getActivities();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🎮 Activity Log
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity Name
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
              {activities.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.activityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* 日付を見やすく整形 */}
                    {new Date(log.startTime).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.endTime ? '✅ Finished' : '🏃 Playing...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {activities.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              ログがまだありません
            </div>
          )}
        </div>
      </div>
    </main>
  );
}