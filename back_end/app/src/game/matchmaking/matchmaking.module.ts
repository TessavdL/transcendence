import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { AuthModule } from 'src/auth/auth.module';
import { MatchmakingGateway } from './matchmaking.gateway';
import { GameModule } from '../game.module';
import { ChatMatchmakingGateway } from './chat_matchmaking.gateway';
import { MatchmakingSharedService } from './matchmaking.shared.service';

@Module({
	imports: [AuthModule, GameModule],
	providers: [MatchmakingGateway, ChatMatchmakingGateway, MatchmakingService, MatchmakingSharedService],
	exports: [MatchmakingGateway, ChatMatchmakingGateway],
})
export class MatchmakingModule { }
