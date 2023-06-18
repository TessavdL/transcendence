import { Module, forwardRef } from '@nestjs/common';
import { ChannelModule } from '../channel/channel.module';
import { PasswordService } from './password.service';
import { RoleModule } from '../role/role.module';

@Module({
	imports: [
		ChannelModule,
		RoleModule
	],
	providers: [PasswordService],
	exports: [PasswordService],
})
export class PasswordModule { }
