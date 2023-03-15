import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtherUserIntraDto } from './dto/other-user-intra.dto';
import { userElement } from './types';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor (private userService: UserService, private prisma: PrismaService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/')
	getUser(@Req() request): User {
		return (request.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('users')
	returnUserElements(@Req() request): Promise<userElement[]> {
		return (this.userService.getUserElements(request.user));
	}

	@UseGuards(JwtAuthGuard)
	@Post('block_user')
	blockUser(@Req() request, @Body() OtherUserIntraDto: OtherUserIntraDto) {
		return (this.userService.blockUser(request.user, OtherUserIntraDto.otherIntraId));
	}

	@UseGuards(JwtAuthGuard)
	@Post('unblock_user')
	unblockUser(@Req() request, @Body() OtherUserIntraDto: OtherUserIntraDto) {
		return (this.userService.unblockUser(request.user, OtherUserIntraDto.otherIntraId));
	}

	@UseGuards(JwtAuthGuard)
	@Get('usersexceptself')
	getUserListExceptSelf(@Req() request): Promise<User[]> {
		return (this.userService.getUserListExceptSelf(request.user));
	}
}
