import { Module, forwardRef } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { TwofaController } from './twofa.controller';
import { AuthModule } from '../auth.module';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [forwardRef(() => AuthModule), AchievementsModule],
  controllers: [TwofaController],
  providers: [TwofaService, AchievementsService]
})
export class TwofaModule { }
