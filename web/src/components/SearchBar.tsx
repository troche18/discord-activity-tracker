'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // URLにある初期値を入れる（リロード対策）
  const [term, setTerm] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // リロード防止

    // 既存のパラメータ(limitなど)があれば維持するためにコピー
    const params = new URLSearchParams(searchParams.toString());
    
    // ページは必ず1に戻す
    params.set('page', '1');

    // 検索ワードがあればセット、なければ削除
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    // ★ `/?` ではなく `${pathname}?` に変更
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search user..."
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      <button 
        type="submit" 
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}