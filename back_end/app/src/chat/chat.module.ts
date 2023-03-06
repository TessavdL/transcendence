import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy';
import { UserClientService } from 'src/user/client/client.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChatController],
  providers: [
    AuthService,
    JwtStrategy,
    ChatService,
    ChatGateway,
    UserClientService,
  ],
})
export class ChatModule {}
