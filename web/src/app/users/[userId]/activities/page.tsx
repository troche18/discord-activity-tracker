import Link from 'next/link';
import SearchBar from '../../../../components/SearchBar';
import Pagination from '../../../../components/Pagination';

// 1. 型定義 (以前と同じ)
type ActivityLog = {
  id: number;
  user: {
    username: string;
    userId: string;
  }
  activityName: string;
  status: string;
  startTime: string;
  endTime: string | null;
  isUnexpectedEnd: boolean;
  createdAt: string;
};

type ActivityLogResponse = {
  data: ActivityLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// 2. データ取得関数 (userIdを受け取るように変更！)
async function getUserActivities(userId: string, page: string, limit: string, search: string): Promise<ActivityLogResponse> {
  // テンプレートリテラルでURLにクエリパラメータを埋め込む
  const res = await fetch(
    `http://localhost:3000/activities?userId=${userId}&page=${page}&limit=${limit}&search=${search}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

// 3. 詳細ページコンポーネント
// params という引数に URLの [userId] 部分が入ってきます
export default async function UserPage({
  params,
  searchParams
}: {
  params: Promise<{ userId: string}>,
  searchParams: Promise<{ page?: string, limit?: string, search?: string }>
}) {
  const { userId } = await params;
  const { page = '1', limit = '50', search = '' } = await searchParams;

  const { data: activities, meta} = await getUserActivities(userId, page, limit, search);

  // ユーザー名を表示するために、ログがあればそこから名前を取る（なければIDを表示）
  const username = activities.length > 0 ? activities[0].user.username : `ID: ${userId}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link href={`/users/${userId}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            ← Back to Users
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
            👤
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {username}'s Activity
          </h1>
        </div>

        {/* 検索バー */}
        <SearchBar />

        {/* テーブル (以前のコードを再利用) */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
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
                  Status
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
                    {new Date(log.startTime).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.endTime ? (
                      log.isUnexpectedEnd ? 
                        <span className="text-red-600 font-bold">⚠️ Unknown</span> : 
                        '✅ Finished'
                    ) : (
                      <span className="text-green-600 font-bold animate-pulse">🏃 Playing...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {activities.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              ログがありません
            </div>
          )}

          {activities.length > 0 && (
            <Pagination page={meta.page} totalPages={meta.totalPages} />
          )}
        </div>
      </div>
    </main>
  );
}