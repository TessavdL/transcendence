import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor (private userService: UserService, private prisma: PrismaService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/')
	getUser(@Req() request): User {
		const user: User = request.user;
		return (user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('userlist')
	getUserList(@Req() request) {
		const user: User = request.user;
		// console.log(user);
		// console.log("going to service");
		return (this.userService.getUserList(user));
	}
}
