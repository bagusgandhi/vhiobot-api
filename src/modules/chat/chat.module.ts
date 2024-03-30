import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatRepository } from './repositories/chat.repositories';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
    imports: [
      TypeOrmModule.forFeature([Chat, User]),
      UserModule
    ],
    providers: [ChatRepository, ChatService],
    controllers: [ChatController],
    exports: [ChatService]
  })
export class ChatModule {}
