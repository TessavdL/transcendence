import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
	ChatModule,
    AuthModule,
	PrismaModule, 
	ConfigModule.forRoot({
		isGlobal: true,
	}),
	UserModule,
  ],
})	
export class AppModule {}
