'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type Props = {
  page: number;
  totalPages: number;
};

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    // 既存のsearchパラメータを維持しつつ、pageだけ変える
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center gap-4 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="py-2">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => handlePageChange(page + 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}