import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, Strategy42 } from './strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { TwofaModule } from './twofa/twofa.module';

@Module({
	imports: [PassportModule, UserModule, JwtModule.register({}), TwofaModule],
	controllers: [AuthController],
	providers: [AuthService, Strategy42, JwtStrategy],
	exports: [AuthService, JwtStrategy],
})
export class AuthModule { }
