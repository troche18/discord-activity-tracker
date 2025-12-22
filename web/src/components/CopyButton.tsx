'use client';

import { useState } from 'react';
import toast from 'react-hot-toast'; // ★ import

export default function CopyButton({ text, label = 'Copy ID' }: { text: string, label?: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      
      // ★ トーストを表示
      toast.success('ID copied to clipboard!', {
        style: {
          border: '1px solid #4ade80',
          padding: '16px',
          color: '#166534',
        },
        iconTheme: {
          primary: '#4ade80',
          secondary: '#FFFAEE',
        },
      });

      // アイコンを一時的にチェックマークに変える演出
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);

    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <button 
      onClick={handleCopy} 
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-md hover:bg-gray-100 border border-transparent hover:border-gray-200"
      title="Click to copy"
    >
      {/* アイコンの切り替え */}
      <span>{isCopied ? '✅' : '📋'}</span>
      <span>{isCopied ? 'Copied!' : label}</span>
    </button>
  );
}