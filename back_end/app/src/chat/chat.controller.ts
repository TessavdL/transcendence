import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Channel, User } from '@prisma/client';
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
		const createdByIntraId: number = request.user.intraId;
		const channelName: string = createChannelDto.channelName;
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

	@Get('findAllMessagesInChannel')
	async findAllMessagesInChannel(@Query('channelName') channelName: string) {
		return await this.chatService.findAllMessagesInChannel(channelName);
	}

	@Get('findAllChannels')
	async findAllChannels(): Promise<Channel[]> {
		return await this.chatService.findAllChannels();
	}
}
