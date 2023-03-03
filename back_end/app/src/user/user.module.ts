import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserClientModule } from './client/client.module';

@Module({
  imports: [UserClientModule],
  controllers: [UserController],
  providers: [AuthService, JwtService, UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
