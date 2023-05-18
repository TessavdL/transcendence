import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [UserModule, MatchmakingModule],
	providers: [GameGateway, GameService]
})
export class GameModule { }
