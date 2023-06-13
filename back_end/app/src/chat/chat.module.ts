import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { SharedService } from './chat.map.shared.service';
import { ChannelModule } from './channel/channel.module';
import { PasswordModule } from './password/password.module';
import { RoleModule } from './role/role.module';
import { MemberModule } from './member/member.module';
import { MessageModule } from './message/message.module';
import { PunishmentModule } from './punishment/punishment.module';
import { GameModule } from 'src/game/game.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		JwtModule.register({}),
		ChannelModule,
		PasswordModule,
		RoleModule,
		MemberModule,
		MessageModule,
		PunishmentModule,
		GameModule
	],
	controllers: [ChatController],
	providers: [
		ChatService,
		ChatGateway,
		SharedService,
	],
})
export class ChatModule { }
