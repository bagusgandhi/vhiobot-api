import { Inject, Logger, OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "../chat/chat.service";
import { DialogflowService } from "../dialogflow/dialogflow.service";
import { v4 as uuidv4 } from 'uuid';
import { CreateChatDto } from "../chat/dto/create-chat.dto";


@WebSocketGateway({ cors: true })
export class SocketGateway implements OnModuleInit {
    private readonly logger = new Logger(SocketGateway.name)

    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(DialogflowService) private readonly dialogflowService: DialogflowService,
        @Inject(ChatService) private readonly chatService: ChatService
    ) { }

    onModuleInit() {
        this.server.on('connect', (socket) => {
            const { room } = socket.handshake.headers;

            this.logger.log(`new socket connection on room: ${room}`);
        })
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() socket: Socket) {
        const { room } = socket.handshake.headers;

        socket.join(room);
        this.logger.log(`joined room: ${room}`);
    }

    @SubscribeMessage('startChatting')
    onStartChatting(@ConnectedSocket() socket: Socket) {
        const { room, name, email } = socket.handshake.headers;

        this.server.to(room).emit('message', {
            sender: 'vhiobot',
            text: `Hai ${name}, Ada yang bisa vhiobot bantu?`,
            timestamp: new Date()
        })

        // this.chatService.startMessage({ room, name, email });
    }

    @SubscribeMessage('sendMessage')
    async onSendMessage(@MessageBody() message: any, @ConnectedSocket() socket: Socket): Promise<void> {
        const { room, name } = socket.handshake.headers;

        const messageData: CreateChatDto = {
            sender: name as string,
            text: message,
            timestamp: new Date()
        }

        this.server.to(room).emit('message', messageData)

        await this.chatService.sendMessage(room as string, messageData);
    }

    @SubscribeMessage('askBot')
    async onAskBot(@MessageBody() message: any, @ConnectedSocket() socket: Socket): Promise<void> {
        const startTime = new Date();
        const { room } = socket.handshake.headers;

        const session = uuidv4();
        const response = await this.dialogflowService.queryText({ message, session });

        const endTime = new Date();
        const responseTime = endTime.getTime() - startTime.getTime();

        const name = 'vhiobot';

        const messageData: CreateChatDto = {
            sender: name,
            text: response,
            timestamp: new Date()
        }

        this.server.to(room).emit('message', messageData);

        this.logger.log(responseTime);

        await this.chatService.sendMessage(room as string, messageData);
    }

}