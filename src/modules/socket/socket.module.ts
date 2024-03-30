import { Module } from '@nestjs/common';
import { DialogflowModule } from '../dialogflow/dialogflow.module';
import { ChatModule } from '../chat/chat.module';
import { DialogflowService } from '../dialogflow/dialogflow.service';
import { ChatService } from '../chat/chat.service';
import { SocketGateway } from './gateway';
import { ChatRepository } from '../chat/repositories/chat.repositories';
import { UserModule } from '../user/user.module';

@Module({
    imports: [DialogflowModule, ChatModule, UserModule],
    providers: [SocketGateway, DialogflowService, ChatService, ChatRepository]

})
export class SocketModule { }
