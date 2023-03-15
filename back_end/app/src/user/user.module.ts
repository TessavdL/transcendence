import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule { }
