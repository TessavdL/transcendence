import { Module } from '@nestjs/common';
import { SocketClientService } from './socketclient.service';

@Module({
	providers: [SocketClientService]
})
export class SocketclientModule {}
