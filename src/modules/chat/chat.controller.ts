import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetUser, IUserRequest } from 'src/decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';
import { GetAllChatDto } from './dto/get-all-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @GetUser() user: IUserRequest,
    @Body() message: CreateChatDto,
  ) {
    return await this.chatService.sendMessage(user.uuid, message);
  }

  @Get()
  async getChatData(@GetUser() user: IUserRequest) {
    return await this.chatService.findChatByUser(user.uuid);
  }

  @Roles(Role.Administrator)
  @Get('all')
  async getAllChat(@Query() query: GetAllChatDto ){
    return await this.chatService.findAll(query);
  }
}
