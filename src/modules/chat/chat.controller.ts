import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) { }

    @Post()
    async sendMessage(@GetUser() user: IUserRequest, @Body() message: CreateChatDto ) {
        return await this.chatService.sendMessage(user.uuid, message);
    }

    @Get()
    async getChatData(@GetUser() user: IUserRequest) {
        return await this.chatService.findChatByUser(user.uuid);
    }
}
