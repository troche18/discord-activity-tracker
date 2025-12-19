// api/src/events/events.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // 本番環境ではフロントエンドのURLに絞ることを推奨
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // 接続している全クライアントにイベントを送信するメソッド
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}