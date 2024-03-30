import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { DatabaseModule } from './config/database/database.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guard/jwt.guard';
import { RolesGuard } from './modules/auth/guard/roles.guard';
import { DialogflowModule } from './modules/dialogflow/dialogflow.module';
import { SocketModule } from './modules/socket/socket.module';


@Module({
  imports: [DatabaseModule, AuthModule, ChatModule, UserModule, DialogflowModule, SocketModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
  ],
})
export class AppModule { }
