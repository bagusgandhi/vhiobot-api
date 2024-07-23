import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { DialogflowService } from '../dialogflow/dialogflow.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateChatDto } from '../chat/dto/create-chat.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import * as moment from 'moment';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnModuleInit {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(DialogflowService)
    private readonly dialogflowService: DialogflowService,
    @Inject(ChatService) private readonly chatService: ChatService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  async addUserToDailySet(userId: string): Promise<void> {
    const today = moment().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format
    const key = `chat_users:${today}`;
    await this.redisService.sadd(key, userId);
  }

  async getDailyUserCount(): Promise<number> {
    const today = moment().format('YYYY-MM-DD');
    const key = `chat_users:${today}`;
    const count = await this.redisService.scard(key);
    return count;
  }

  countTotalRooms(): number {
    const rooms = this.server.sockets.adapter.rooms;
    // Filtering out individual sockets as they also appear as rooms
    const totalRooms = [...rooms.keys()].filter(
      (room) => !rooms.get(room).has(room),
    );
    return totalRooms.length;
  }

  async handleSetConversation() {
    const currentTime = moment().format('YYYY-MM-DD');
    const currentValue: string = await this.redisService.get(`conversation_${currentTime}`);
    if(!currentValue){
      await this.redisService.set(`conversation_${currentTime}`, `${1}`, 60 * 60 * 24);
    } else {
      const counter = parseInt(currentValue) + 1;
      this.logger.log("counter", counter)
      await this.redisService.set(`conversation_${currentTime}`, `${counter}`, 60 * 60 * 24);
    }
  }

  onModuleInit() {
    this.server.on('connect', (socket) => {
      socket.on('disconnect', () => {
        this.handleLeaveRoom(socket);
      });
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() socket: Socket) {
    const { room }: any = socket.handshake.headers;
    if (room) {
      socket.leave(room);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() socket: Socket) {
    const { room }: any = socket.handshake.headers;

    socket.join(room);
    this.logger.log(`joined room: ${room}`);

    await this.addUserToDailySet(room);
  }

  @SubscribeMessage('startChatting')
  async onStartChatting(@ConnectedSocket() socket: Socket) {
    const { room, name } = socket.handshake.headers;

    const messageData: CreateChatDto = {
      sender: 'vhiobot',
      text: `Hai ${name}, Ada yang bisa vhiobot bantu?`,
      timestamp: new Date(),
    };

    this.server.to(room).emit('message', messageData);

    await this.chatService.sendMessage(room as string, messageData);
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { room, name } = socket.handshake.headers;

    this.logger.log('room', room);

    const messageData: CreateChatDto = {
      sender: name as string,
      text: message,
      timestamp: new Date(),
    };

    this.server.to(room).emit('message', messageData);

    await this.chatService.sendMessage(room as string, messageData);
  }

  @SubscribeMessage('askBot')
  async onAskBot(
    @MessageBody() message: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const startTime = new Date();
    const { room } = socket.handshake.headers;

    const session = uuidv4();
    const response = await this.dialogflowService.queryText({
      message,
      session,
    });

    const endTime = new Date();
    const responseTime = endTime.getTime() - startTime.getTime();

    const name = 'vhiobot';

    const messageData: CreateChatDto = {
      sender: name,
      text: response,
      timestamp: new Date(),
    };

    this.server.to(room).emit('message', messageData);

    this.logger.log('responseTime', responseTime);

    await this.chatService.sendMessage(room as string, messageData);
    await this.handleSetConversation();
  }

  @Cron(CronExpression.EVERY_SECOND)
  async realtimeSeries() {
    const date = new Date().getTime();
    const counts = this.countTotalRooms();
    const totalDaily = await this.getDailyUserCount();
    const currentConversation = await this.redisService.get(`conversation_${moment().format('YYYY-MM-DD')}`);
    const activeUser = {
      y: counts,
      x: date,
    };

    this.server.emit('activeUser', [activeUser, totalDaily, currentConversation]);
    this.logger.log(`total user daily`, await this.getDailyUserCount());
  }
}
