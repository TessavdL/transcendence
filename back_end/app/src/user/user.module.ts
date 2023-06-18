import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AchievementsService } from 'src/achievements/achievements.service';
import { UserGateway } from './user.gateway';
import { UserSharedService } from './user.shared.service';

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [UserController],
	providers: [
		AchievementsService,
		UserService,
		UserSharedService,
		UserGateway],
	exports: [UserService],
})
export class UserModule { }
