import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthGuard42 } from './guards';

@Controller('auth')
export class AuthController {
	constructor (private authService: AuthService) {}

	@UseGuards(AuthGuard42)
	@Get('login')
	async login (@Request() req) {
		return req.user;
	}

	@UseGuards(AuthGuard42)
	@Get('callback')
	handle_intra_return(@Request() req) {
		const user: User = req.user;
		console.log(`Hello ${user.intraName}, you have logged in!`);
		return user;
	}

	// jwt guard
	@Get('protected')
	print_hello_world() {
		return ("Hello World!");
	}
}
