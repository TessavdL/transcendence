import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AchievementsModule } from './achievements/achievements.module';
import { MatchmakingModule } from './game/matchmaking/matchmaking.module';

@Module({
	imports: [
		UserModule,
		ChatModule,
		AuthModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		GameModule,
		MatchmakingModule,
		AchievementsModule,
	],
})
export class AppModule { }
