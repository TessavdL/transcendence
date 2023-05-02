import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [UserController],
	providers: [
		UserService,
		AchievementsService],
	exports: [UserService],
})
export class UserModule { }
