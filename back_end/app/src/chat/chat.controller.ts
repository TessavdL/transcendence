import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Channel, DMChannel, User } from '@prisma/client';
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

	@Post('dmmessage')
	async addMessageToDMChannel(addMessageToChannelDto: AddMessageToChannelDto) {
		const intraId: number = addMessageToChannelDto.intraId;
		const channelName: string = addMessageToChannelDto.channelName;
		const name: string = addMessageToChannelDto.name;
		const text: string = addMessageToChannelDto.text;
		return await this.chatService.addMessageToDMChannel(intraId, channelName, name, text)
	}

	@Get('findAllMessagesInChannel')
	async findAllMessagesInChannel(@Query('channelName') channelName: string) {
		return await this.chatService.findAllMessagesInChannel(channelName);
	}

	@Get('findAllChannels')
	async findAllChannels(): Promise<Channel[]> {
		return await this.chatService.findAllChannels();
	}

	// @Get('findMyChannels')
	// async findMyChannels(@Req() request): Promise<Channel[]> {
	// 	return await this.chatService.findMyChannels();
	// }

	@Get('findAllDMChannels')
	async findAllDMChannels(): Promise<DMChannel[]> {
		return await this.chatService.findAllDMChannels();
	}

	@Get('findMyDMChannels')
	async findMyDMChannels(@Req() request): Promise<DMChannel[]> {
		const user: User = request.user;
		return await this.chatService.findMyDMChannels(user);
	}

	// @Post('message')
	// async addMessageToChannel(addMessageToChannelDto: AddMessageToChannelDto) {
	// 	const intraId: number = addMessageToChannelDto.intraId;
	// 	const channelName: string = addMessageToChannelDto.channelName;
	// 	const name: string = addMessageToChannelDto.name;
	// 	const text: string = addMessageToChannelDto.text;
	// 	return await this.chatService.addMessageToChannel(intraId, channelName, name, text)
	// }
}
