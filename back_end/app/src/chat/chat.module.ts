import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserClientService } from 'src/user/client/client.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChatController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    ChatService,
    ChatGateway,
    UserClientService,
  ],
})
export class ChatModule {}
