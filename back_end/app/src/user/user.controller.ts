import { Body, Controller, Get, Post, Req, UseGuards, Param, UseInterceptors, BadRequestException, UploadedFile, Query, StreamableFile, Put, All, NotFoundException } from '@nestjs/common';
import { Achievements, MatchHistory, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtherUserIntraDto } from './dto/other-user-intra.dto';
import { FriendRequestList, UserElement } from './types';
import { UserService } from './user.service';
import { AvatarInterceptor } from './interceptor/avatar.interceptor';
import { UPLOADS_DIRECTORY } from './utils/constants';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UpdateUsernameDto } from './dto/update-username-dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
	constructor(private userService: UserService, private prisma: PrismaService) { }

	@Get('/')
	async getUser(@Req() request): Promise<User> {
		return (await this.userService.getUserWithAchievements(request.user));
	}

	@Get('users')
	async returnUserElements(@Req() request): Promise<UserElement[]> {
		return (await this.userService.getUserElements(request.user));
	}

	@Post('block_user')
	async blockUser(@Req() request, @Body() otherUserIntraDto: OtherUserIntraDto) {
		return (await this.userService.blockUser(request.user, otherUserIntraDto.otherIntraId));
	}

	@Post('unblock_user')
	async unblockUser(@Req() request, @Body() otherUserIntraDto: OtherUserIntraDto) {
		return (await this.userService.unblockUser(request.user, otherUserIntraDto.otherIntraId));
	}

	@Post('friend_request')
	async handleFriendRequest(@Req() request, @Body() otherUserIntraDto: OtherUserIntraDto) {
		return (await this.userService.handleFriendRequest(request.user, otherUserIntraDto.otherIntraId));
	}

	@Get('usersexceptself')
	async getUserListExceptSelf(@Req() request): Promise<User[]> {
		return (await this.userService.getUserListExceptSelf(request.user));
	}

	@Get('friend_request_list')
	async getFriendRequests(@Req() request): Promise<FriendRequestList[]> {
		return (await this.userService.getFriendRequests(request.user));
	}

	@Get('createdummy')
	async createDummyUser(): Promise<void> {
		return (await this.userService.createDummyUser());
	}

	@Get('get_avatar')
	getAvatar(@Query('avatar') avatar: string): StreamableFile {
		return (this.userService.getAvatar(avatar));
	}

	@Get('get_match_history')
	async getMatchHistory(@GetUser() user: User): Promise<MatchHistory[]> {
		return (await this.userService.getMatchHistory(user.intraId));
	}

	@Get('get_match_history_by_intraid')
	async getMatchHistoryByIntraId(@Query() query): Promise<MatchHistory[]> {
		const otherIntraId: number = parseInt(query.intraId);
		return (await this.userService.getMatchHistory(otherIntraId));
	}

	@Get('get_leaderboard')
	async getLeaderboard(): Promise<User[]> {
		return (await this.userService.getLeaderboard());
	}

	@Get(':id')
	async getUserElementBasedOnIntraId(@Req() request, @Param() params): Promise<UserElement> {
		if (!params || !params.id) {
			throw new BadRequestException();
		}
		const user: User = request.user;
		const otherIntraId: number = parseInt(params.id);
		return (await this.userService.getUserElementBasedOnIntraId(user, otherIntraId));
	}

	@Get('achievements/:id')
	async getOtherUserAchievements(@Req() request, @Param() params): Promise<(User & { achievements: Achievements })> {
		const user: User = request.user;
		const otherIntraId: number = parseInt(params.id);
		return (await this.userService.getOtherUserAchievements(user, otherIntraId));
	}

	@Put('update_username')
	async updateUsername(@GetUser() user: User, @Body() updateUsernameDto: UpdateUsernameDto) {
		return (await this.userService.updateUsername(user, updateUsernameDto.username))
	}

	@Post('avatar')
	@UseInterceptors(AvatarInterceptor)
	async uploadAvatar(
		@GetUser() user: User,
		@UploadedFile() file: Express.Multer.File
	): Promise<string> {
		if (!file || !file.filename) {
			throw new BadRequestException('No file uploaded');
		}
		const filePath = `${UPLOADS_DIRECTORY}/${file.filename}`;

		await this.userService.updateAvatar(user.intraId, filePath);
		return (filePath);
	}

	@All('/*')
	handleWildcard(@Req() request: Request) {
		throw new NotFoundException(`Route not found`);
	}
}
