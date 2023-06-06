import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { SharedService } from './chat.map.shared.service';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [AuthModule, UserModule, JwtModule.register({}), GameModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    SharedService,
  ],
})
export class ChatModule { }
