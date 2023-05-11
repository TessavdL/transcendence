import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

@Module({
  providers: [GameGateway, GameService],
  imports: [MatchmakingModule]
})
export class GameModule {}
