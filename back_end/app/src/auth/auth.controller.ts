import { Body, Controller, Get, Post, Query, Req, Request, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto'; 
import { AuthGuard42 } from './guards';

@Controller('auth')
export class AuthController {
	constructor (private authService: AuthService) {}

	@UseGuards(AuthGuard42)
	@Get('login')
	async login (@Request() req) {
		console.log("In login");
		return req.user;
	}

	@UseGuards(AuthGuard42)
	@Get('callback')
	handle_intra_return(@Query() req) {
		console.log("In callback");
		console.log(req);
		return req;
	}
}
