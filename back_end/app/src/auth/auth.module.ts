import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Strategy42 } from './strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [PassportModule],
	controllers: [AuthController],
	providers: [AuthService, Strategy42],
})
export class AuthModule {}
