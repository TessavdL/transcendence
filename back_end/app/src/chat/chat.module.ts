import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserClientService } from 'src/user/client/client.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule, JwtModule.register({})],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    UserClientService,
  ],
})
export class ChatModule { }
