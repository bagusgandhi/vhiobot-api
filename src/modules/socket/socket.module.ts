import { Module } from '@nestjs/common';
import { DialogflowModule } from '../dialogflow/dialogflow.module';
import { ChatModule } from '../chat/chat.module';
import { DialogflowService } from '../dialogflow/dialogflow.service';
import { ChatService } from '../chat/chat.service';
import { SocketGateway } from './gateway';
import { ChatRepository } from '../chat/repositories/chat.repositories';
import { UserModule } from '../user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DialogflowModule, ChatModule, UserModule, ScheduleModule.forRoot(), RedisModule],
  providers: [SocketGateway, DialogflowService, ChatService, ChatRepository],
})
export class SocketModule {}
