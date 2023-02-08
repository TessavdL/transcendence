import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
	ChatModule,
	PrismaModule, 
	ConfigModule.forRoot({
		isGlobal: true,
	}),
  ],
})	
export class AppModule {}
