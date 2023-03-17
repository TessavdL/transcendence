import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Channel, DMChannel, User, UserMessage } from '@prisma/client';
import { channel } from 'diagnostics_channel';
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

	@Post('addUserToChannel')
	async addUserToChannel(@Req() request, @Body() addToChannelDto: CreateChannelDto): Promise<void> {
		const user: User = request.user;
		const channelName: string = addToChannelDto.channelName;
		return await this.chatService.addUserToChannel(user, channelName);
	}

	@Post('createDMChannel')
	async createDMChannel(@Req() request, @Body() createDMChannelDto: CreateDMChannelDto): Promise<string> {
		const user: User = request.user;
		const otherIntraId: number = createDMChannelDto.otherIntraId;
		return await this.chatService.createDMChannel(user, otherIntraId);
	}

	@Get('findAllChannels')
	async findAllChannels(): Promise<Channel[]> {
		return await this.chatService.findAllChannels();
	}

	@Get('findMyChannels')
	async findMyChannels(@Req() request): Promise<Channel[]> {
		const user = request.user;
		return await this.chatService.findMyChannels(user);
	}

	@Get('findAllDMChannels')
	async findAllDMChannels(): Promise<DMChannel[]> {
		return await this.chatService.findAllDMChannels();
	}

	@Get('findMyDMChannels')
	async findMyDMChannels(@Req() request): Promise<DMChannel[]> {
		const user: User = request.user;
		return await this.chatService.findMyDMChannels(user);
	}

	@Get('findAllMessagesInChannel')
	async findAllMessagesInChannel(@Query() params: { channelName: string, channelType: string }): Promise<UserMessage[]> {
		const channelName: string = params.channelName;
		const channelType: string = params.channelType;
		if (channelType === 'channel') {
			return await this.chatService.findAllMessagesInChannel(channelName);
		}
		else {
			return await this.chatService.findAllMessagesInDMChannel(channelName);
		}
	}
}
