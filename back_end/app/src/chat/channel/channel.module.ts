import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { RoleModule } from '../role/role.module';

@Module({
	imports: [RoleModule],
	providers: [ChannelService],
	exports: [ChannelService],
})
export class ChannelModule { }
