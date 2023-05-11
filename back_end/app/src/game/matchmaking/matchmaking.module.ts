import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule],
	providers: [MatchmakingService]
})
export class MatchmakingModule { }
