import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Channel, User, UserMessage, type ChannelType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { ChatService } from './chat.service';
import { AddUserToChannelDto } from './dto/add-user-to-channel.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateDMChannelDto } from './dto/create-dm-channel.dto';


@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Post('createChannel')
	async createChannel(@Req() request, @Body() createChannelDto: CreateChannelDto): Promise<string> {
		const user: User = request.user;
		const channelName: string = createChannelDto.channelName;
		return await this.chatService.createChannel(channelName, user.intraId);
	}

	@Post('createDMChannel')
	async createDMChannel(@Req() request, @Body() createDMChannelDto: CreateDMChannelDto): Promise<string> {
		const user: User = request.user;
		const otherIntraId: number = createDMChannelDto.otherIntraId;
		return await this.chatService.createDMChannel(user, otherIntraId);
	}

	@Post('addUserToChannel')
	async addUserToChannel(@Req() request, @Body() addUserToChannel: AddUserToChannelDto): Promise<void> {
		const user: User = request.user;
		const intraId: number = user.intraId;
		const channelName: string = addUserToChannel.channelName;
		return await this.chatService.addUserToChannel(intraId, channelName);
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

	@Get('findAllMessagesInChannel')
	async findAllMessagesInChannel(@Query() params: { channelName: string }): Promise<UserMessage[]> {
		const channelName: string = params.channelName;
		return await this.chatService.findAllMessagesInChannel(channelName);
	}
}
