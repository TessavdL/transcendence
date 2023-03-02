import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SocketclientModule } from './socketclient/socketclient.module';

@Module({
  imports: [SocketclientModule],
  controllers: [UserController],
  providers: [AuthService, JwtService, UserService, JwtStrategy],
  exports: [UserService]
})
export class UserModule {}
