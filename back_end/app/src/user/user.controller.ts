import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
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
    @Get('block_user')
    blockUser(@Req() request, @Query('otherUser') otherUser: string) {
        return (this.userService.blockUser(request.user, otherUser));
    }

	@UseGuards(JwtAuthGuard)
	@Get('usersexceptself')
	getUserListExceptSelf(@Req() request): Promise<User[]> {
		return (this.userService.getUserListExceptSelf(request.user));
	}
}
