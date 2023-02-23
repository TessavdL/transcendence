import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('user')
export class UserController {
	constructor (private prisma: PrismaService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/')
	getUser(@Req() request): User {
		const user: User = request.user;
		return (user);
	}
}
