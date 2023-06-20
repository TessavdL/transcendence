import { Body, Controller, Get, Post, Patch, Query, Req, UseGuards, Delete, All, NotFoundException } from '@nestjs/common';
import { Channel, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { AddAnotherUserToChannelDto, AddUserToChannelDto, ChangePasswordDto, CreateChannelDto, CreateDMChannelDto, DeletePasswordDto, PromoteMemberToAdminDto } from './dto';
import { RemoveUserFromChannelDto } from './dto/remove-user-from-channel.dto';
import { Punishment, DMChannel, Member, Message } from './types';
import { GetUser } from 'src/decorators/get-user.decorator';
import { PasswordService } from './password/password.service';
import { ChannelService } from './channel/channel.service';
import { MessageService } from './message/message.service';
import { MemberService } from './member/member.service';
import { RoleService } from './role/role.service';
import { PunishmentService } from './punishment/punishment.service';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
	constructor(
		private readonly channelService: ChannelService,
		private readonly memberService: MemberService,
		private readonly messageService: MessageService,
		private readonly passwordService: PasswordService,
		private readonly punishmentService: PunishmentService,
		private readonly roleService: RoleService,
	) { }

	// CHANNEL

	// promise could be void?
	@Post('createChannel')
	async createChannel(@GetUser() user: User, @Body() createChannelDto: CreateChannelDto): Promise<string> {
		const channelName = await this.channelService.createChannel(createChannelDto.channelMode, createChannelDto.channelName, user.intraId);
		if (createChannelDto.channelMode === 'PROTECTED') {
			this.passwordService.setPasswordAndSetChannelModeToProtected(user, channelName, createChannelDto.password);
		}
		return channelName;
	}

	@Post('createDMChannel')
	async createDMChannel(@GetUser() user: User, @Body() createDMChannelDto: CreateDMChannelDto): Promise<string> {
		return await this.channelService.createDMChannel(user, createDMChannelDto.otherIntraId);
	}

	@Post('addUserToChannel')
	async addUserToChannel(@GetUser() user: User, @Body() addUserToChannelDto: AddUserToChannelDto): Promise<void> {
		return await this.channelService.addUserToChannel(user.intraId, addUserToChannelDto.channelName);
	}

	@Post('addAnotherUserToChannel')
	async addAnotherUserToChannel(@Body() addAnotherUserToChannelDto: AddAnotherUserToChannelDto): Promise<void> {
		return await this.channelService.addUserToChannel(addAnotherUserToChannelDto.otherIntraId, addAnotherUserToChannelDto.channelName);
	}

	@Delete('removeUserFromChannel')
	async removeUserFromChannel(@GetUser() user: User, @Body() removeUserFromChannelDto: RemoveUserFromChannelDto): Promise<void> {
		return await this.channelService.removeUserFromChannel(user.intraId, removeUserFromChannelDto.channelName);
	}

	@Get('getChannelType')
	async getChannelInfo(@Query() params: { channelName: string }): Promise<string> {
		return ((await this.channelService.getChannel(params.channelName)).channelMode);
	}

	@Get('getAllChannels')
	async getAllChannels(): Promise<Channel[]> {
		return await this.channelService.getAllChannels();
	}

	@Get('getMyChannels')
	async getMyChannels(@GetUser() user: User): Promise<Channel[]> {
		return await this.channelService.getMyChannels(user);
	}

	@Get('getMyDMChannelsWithUser')
	async getMyDMChannelsWithUser(@GetUser() user: User): Promise<DMChannel[]> {
		return await this.channelService.getMyDMChannelsWithUser(user);
	}

	// MESSAGE

	// uses query, should do more input checking?
	@Get('getAllMessagesInChannel')
	async getAllMessagesInChannel(@GetUser() user: User, @Query() params: { channelName: string }): Promise<Message[]> {
		const channelName: string = params.channelName;
		return await this.messageService.getFilteredMessages(user, channelName);
	}

	// PASSWORD
	// uses query, should do more input checking?
	@Get('checkPassword')
	async checkPassword(@Query() params: { channelName: string, password: string }): Promise<boolean> {
		return await this.passwordService.checkPassword(params.channelName, params.password);
	}

	@Patch('changePassword')
	async changePassword(@GetUser() user: User, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
		return await this.passwordService.changePassword(user, changePasswordDto.channelName, changePasswordDto.oldPassword, changePasswordDto.newPassword);
	}

	@Patch('deletePassword')
	async deletePassword(@GetUser() user: User, @Body() deletePasswordDto: DeletePasswordDto): Promise<void> {
		return await this.passwordService.deletePasswordAndSetChannelModeToPublic(user, deletePasswordDto.channelName, deletePasswordDto.password);
	}

	@Patch('setPassword')
	async setPassword(@GetUser() user: User, @Body() setPasswordDto: DeletePasswordDto): Promise<void> {
		await this.passwordService.setPasswordAndSetChannelModeToProtected(user, setPasswordDto.channelName, setPasswordDto.password);
	}

	// MEMBER	

	@Get('getMembersInChannel')
	async getMembersInChannel(@Query() params: { channelName: string }): Promise<Member[]> {
		const channelName: string = params.channelName;
		return await this.memberService.getMembersInChannel(channelName);
	}

	// ROLE

	@Patch('promoteMemberToAdmin')
	async promoteMember(@GetUser() user: User, @Body() promoteMemberToAdminDto: PromoteMemberToAdminDto): Promise<void> {
		const channelName: string = promoteMemberToAdminDto.channelName;
		const otherIntraId: number = promoteMemberToAdminDto.otherIntraId;
		return await this.roleService.promoteMemberToAdmin(user, promoteMemberToAdminDto.channelName, promoteMemberToAdminDto.otherIntraId);
	}

	@Patch('demoteAdminToMember')
	async demoteAdmin(@GetUser() user: User, @Body() demoteAdminToMember: PromoteMemberToAdminDto): Promise<void> {
		const channelName: string = demoteAdminToMember.channelName;
		const otherIntraId: number = demoteAdminToMember.otherIntraId;
		return await this.roleService.demoteAdminToMember(user, channelName, otherIntraId);
	}

	// PUNISHMENT

	// uses query, should do more input checking?
	@Get('amIBanned')
	async amIBanned(@GetUser() user: User, @Query() params: { channelName: string }): Promise<Punishment> {
		return await this.punishmentService.isMemberBanned(user.intraId, params.channelName);
	}

	// uses query, should do more input checking?
	// so far unused
	// remove?
	@Get('isMemberBanned')
	async isMemberBanned(@Query() params: { intraId: number, channelName: string }): Promise<Punishment> {
		return await this.punishmentService.isMemberBanned(params.intraId, params.channelName);
	}

	// uses query, should do more input checking?
	@Get('amIMuted')
	async amIMuted(@GetUser() user: User, @Query() params: { channelName: string }): Promise<Punishment> {
		return await this.punishmentService.isMemberMuted(user.intraId, params.channelName);
	}

	// uses query, should do more input checking?
	// so far unused
	// remove?
	@Get('isMemberMuted')
	async isMemberMuted(@Query() params: { intraId: number, channelName: string }): Promise<Punishment> {
		return await this.punishmentService.isMemberMuted(params.intraId, params.channelName);
	}

	@All('*')
	handleWildcard() {
		throw new NotFoundException('Endpoint not found');
	}
}
