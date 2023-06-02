import { Module, forwardRef } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { TwofaController } from './twofa.controller';
import { AuthModule } from '../auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [TwofaController],
  providers: [TwofaService]
})
export class TwofaModule { }
