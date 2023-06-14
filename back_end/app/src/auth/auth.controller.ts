import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard42, JwtAuthGuard } from './guards';
import { GetUser } from 'src/decorators/get-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private readonly configService: ConfigService
	) { }

	@UseGuards(AuthGuard42)
	@Get('login')
	async login(@GetUser() user: User): Promise<any> {
		console.log(`http://${this.configService.get('HOST')}:3001/auth/callback`);
		return user;
	}

	@UseGuards(AuthGuard42)
	@Get('callback')
	async handleIntraReturn(@GetUser() user: User, @Res({ passthrough: true }) res: Response): Promise<void> {
		console.log(`http://${this.configService.get('HOST')}:3001/auth/callback`)
		if (user.twofaStatus === true) {
			return res.redirect(`http://${this.configService.get('HOST')}:5173/twofa?intraId=${user.intraId}`);
		}
		return this.authService.setBearerToken(user, res);
	}

	@UseGuards(JwtAuthGuard)
	@Get('logout')
	logout(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(user, res);
	}
}
