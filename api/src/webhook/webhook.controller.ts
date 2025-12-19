// api/src/webhook/webhook.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Controller('internal/webhook')
export class WebhookController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @Post('update')
  async handleUpdate(@Body() payload: any) {
    console.log('🔔 Webhook received:', payload);
    
    // フロントエンドに向けて 'log_updated' イベントを発火
    // payloadには { type: 'activity' | 'status', userId: '...', data: ... } 等を含める想定
    this.eventsGateway.broadcast('log_updated', payload);
    
    return { success: true };
  }
}