import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { UserModule } from 'src/user/user.module';
import { SharedService } from './game.shared.service';

@Module({
	imports: [UserModule],
	providers: [GameGateway, GameService, SharedService],
	exports: [SharedService],
})
export class GameModule { }
