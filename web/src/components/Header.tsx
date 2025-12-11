// 1. Next.js専用のリンク機能をインポート
import Link from 'next/link';

export default function Header() {
  return (
    // Tailwind CSS で見た目を整える (背景色、文字色、パディング)
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* 左側: アプリのロゴ/タイトル */}
        <div className="font-bold text-xl">
          <Link href="/" className="hover:text-blue-400">
            Discord Tracker
          </Link>
        </div>

        {/* 右側: ナビゲーションメニュー */}
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-gray-300 transition-colors">
                Activities
              </Link>
            </li>
            <li>
              {/* まだページは作っていませんが、リンクだけ先に用意しましょう */}
              <Link href="/status" className="hover:text-gray-300 transition-colors">
                Status
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}