'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

export default function SocketListener({ userId }: { userId?: string }) {
  const router = useRouter();

  useEffect(() => {
    // APIサーバーへ接続
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socket.on('log_updated', (payload) => {
      console.log('🔔 Event received:', payload);

      // 特定のユーザーのページを見ているなら、その人の更新の時だけリフレッシュする
      if (userId) {
        if (payload.userId === userId) {
          router.refresh(); // サーバーコンポーネントの再取得(RSC payload refresh)
        }
      } else {
        // 全体リスト(ルートページ)などは常に更新してもいいかも
        router.refresh();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [router, userId]);

  return null; // UIには何も表示しない
}