import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [UserModule],
	providers: [GameGateway, GameService]
})
export class GameModule { }
