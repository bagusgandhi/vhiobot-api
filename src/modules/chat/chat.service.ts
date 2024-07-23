import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repositories';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UserService } from '../user/user.service';
import { GetAllChatDto } from './dto/get-all-chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userService: UserService,
  ) {}


  async findAll(query: GetAllChatDto){
    try {
      const chat = await this.chatRepository.queryPaginate(query.page, query.limit);
      return chat;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async findChatByUser(userId: string) {
    try {
      const chat = await this.chatRepository.findByUserId(userId);
      return chat;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }

  async sendMessage(userId: string, createChatDto: CreateChatDto) {
    try {
      this.logger.log(userId);

      const chat = await this.findChatByUser(userId);

      const user = await this.userService.findUserById(userId);
      const { text, timestamp, sender } = createChatDto;
      const newMessage = { text, timestamp: timestamp, sender };

      if (!chat) {
        // create chat data
        const newChat = new Chat();
        newChat.message = [newMessage];
        newChat.user = user;
        return this.chatRepository.save(newChat);
      }

      // update chat
      return await this.chatRepository.save({
        uuid: chat.uuid,
        message: [...chat.message, newMessage],
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.statusCode);
    }
  }
}
