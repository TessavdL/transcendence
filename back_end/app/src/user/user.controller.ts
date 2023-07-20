import { Body, Controller, Get, Post, Req, UseGuards, Param, UseInterceptors, BadRequestException, UploadedFile, Query, StreamableFile, Put, All, NotFoundException } from '@nestjs/common';
import { Achievements, MatchHistory, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestList, UserElement } from './types';
import { UserService } from './user.service';
import { AvatarInterceptor } from './interceptor/avatar.interceptor';
import { UPLOADS_DIRECTORY } from './utils/constants';
import { GetUser } from 'src/decorators/get-user.decorator';
import { OtherUserIdDto, UpdateNameDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
	constructor(private userService: UserService, private prisma: PrismaService) { }

	@Get('/')
	async getUser(@GetUser() user: User): Promise<User> {
		return (await this.userService.getUserWithAchievements(user));
	}

	@Get('users')
	async returnUserElements(@Req() request): Promise<UserElement[]> {
		return (await this.userService.getUserElements(request.user));
	}

	@Post('block_user')
	async blockUser(@Req() request, @Body() otherUserIdDto: OtherUserIdDto) {
		return (await this.userService.blockUser(request.user, otherUserIdDto.otherUserId));
	}

	@Post('unblock_user')
	async unblockUser(@Req() request, @Body() otherUserIdDto: OtherUserIdDto) {
		return (await this.userService.unblockUser(request.user, otherUserIdDto.otherUserId));
	}

	@Post('friend_request')
	async handleFriendRequest(@Req() request, @Body() otherUserIdDto: OtherUserIdDto) {
		return (await this.userService.handleFriendRequest(request.user, otherUserIdDto.otherUserId));
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
		return (await this.userService.getMatchHistory(user.id));
	}

	@Get('get_match_history_by_id')
	async getMatchHistoryById(@Query() query): Promise<MatchHistory[]> {
		const otherUserId: string = query.id;
		return (await this.userService.getMatchHistory(otherUserId));
	}

	@Get('get_leaderboard')
	async getLeaderboard(): Promise<User[]> {
		return (await this.userService.getLeaderboard());
	}

	@Get(':id')
	async getUserElementBasedOnId(@Req() request, @Param() params): Promise<UserElement> {
		if (!params || !params.id) {
			throw new BadRequestException();
		}
		const user: User = request.user;
		const otherUserId: string = params.id;
		return (await this.userService.getUserElementBasedOnId(user, otherUserId));
	}

	@Get('achievements/:id')
	async getOtherUserAchievements(@Req() request, @Param() params): Promise<(User & { achievements: Achievements })> {
		const user: User = request.user;
		const otherUserId: string = params.id;
		return (await this.userService.getOtherUserAchievements(user, otherUserId));
	}

	@Put('update_name')
	async updateName(@GetUser() user: User, @Body() UpdateNameDto: UpdateNameDto) {
		return (await this.userService.updateName(user, UpdateNameDto.name))
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

		await this.userService.updateAvatar(user.id, filePath);
		return (filePath);
	}

	@All('/*')
	handleWildcard(@Req() request: Request) {
		throw new NotFoundException(`Route not found`);
	}
}
