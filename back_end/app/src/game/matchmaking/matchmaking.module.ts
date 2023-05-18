import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { AuthModule } from 'src/auth/auth.module';
import { MatchmakingGateway } from './matchmaking.gateway';
import { SharedService } from '../game.shared.service';

@Module({
	imports: [AuthModule],
	providers: [MatchmakingGateway, MatchmakingService, SharedService],
	exports: [MatchmakingGateway],
})
export class MatchmakingModule { }
