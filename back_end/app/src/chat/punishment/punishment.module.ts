import { Module } from '@nestjs/common';
import { PunishmentService } from './punishment.service';

@Module({
	providers: [PunishmentService],
	exports: [PunishmentService],
})
export class PunishmentModule { }
