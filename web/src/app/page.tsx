import Link from 'next/link';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

// 1. ユーザーの型定義
type User = {
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type UserResponse = {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// 2. ユーザー一覧を取得する関数
async function getUsers(page: string, limit: string, search: string): Promise<UserResponse> {
  const res = await fetch(
    `http://localhost:3000/users?page=${page}&limit=${limit}&search=${search}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return res.json();
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ page?: string, limit?: string, search?: string }>
}) {
  const { page = '1', limit = '50', search = '' } = await searchParams;
  
  const { data: users, meta } = await getUsers(page, limit, search);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          👥 Select User
        </h1>

        {/* 検索バー */}
        <SearchBar />

        {/* ユーザーカードのグリッド表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => (
            <Link 
              key={user.userId} 
              href={`/users/${user.userId}`}
              className="block group"
            >
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 group-hover:shadow-md group-hover:border-blue-300 group-hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                  {/* アイコン代わりの丸 */}
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
                      {user.username}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ID: {user.userId}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            ユーザーがまだ登録されていません
          </div>
        )}

        {users.length > 0 && (
          <Pagination page={meta.page} totalPages={meta.totalPages} />
        )}
      </div>
    </main>
  );
}