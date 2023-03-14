import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { ChatService } from './chat.service';
import { AddMessageToChannelDto } from './dto/add-message-to-channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateDMChannelDto } from './dto/create-dmchannel.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) { }
	@Post('createChannel')
	async createChannel(@Req() request, @Body() createChannelDto: CreateChannelDto): Promise<string> {
		const user: User = request.user;
		console.log(user);
		console.log(createChannelDto);
		const createdByIntraId: number = request.user.intraId;
		const channelName: string = createChannelDto.channelName;
		console.log(channelName, createdByIntraId);
		return await this.chatService.createChannel(channelName, createdByIntraId);
	}

	@Post('createDMChannel')
	async createDMChannel(@Req() request, @Body() createDMChannelDto: CreateDMChannelDto): Promise<string> {
		const user: User = request.user;
		const otherIntraId: number = createDMChannelDto.otherIntraId;
		return await this.chatService.createDMChannel(user, otherIntraId);
	}

	@Post('message')
	async addMessageToChannel(addMessageToChannelDto: AddMessageToChannelDto) {
		const intraId: number = addMessageToChannelDto.intraId;
		const channelName: string = addMessageToChannelDto.channelName;
		const name: string = addMessageToChannelDto.name;
		const text: string = addMessageToChannelDto.text;
		return await this.chatService.addMessageToChannel(intraId, channelName, name, text)
	}
}
