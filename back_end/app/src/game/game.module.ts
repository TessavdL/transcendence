import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { GameSharedService } from './game.shared.service';

@Module({
	imports: [UserModule],
	providers: [GameGateway, GameService, GameSharedService],
	exports: [GameSharedService],
})
export class GameModule { }
