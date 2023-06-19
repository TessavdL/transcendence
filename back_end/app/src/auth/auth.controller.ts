import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard42, JwtAuthGuard } from './guards';
import { GetUser } from 'src/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
	) { }

	@UseGuards(AuthGuard42)
	@Get('login')
	async login(@GetUser() user: User): Promise<any> {
		return user;
	}

	@UseGuards(AuthGuard42)
	@Get('callback')
	async handleIntraReturn(@GetUser() user: User, @Res({ passthrough: true }) res: Response): Promise<void> {
		// if (user.twofaStatus === true) {
		// 	// return res.redirect(`http://${process.env.HOST}:5173/twofa?intraId=${user.intraId}`);
		// 	return res.redirect(`http://${process.env.HOST}:5173/twofactorvarify`);
		// }
		return this.authService.setBearerToken(user, res);
	}

	@UseGuards(JwtAuthGuard)
	@Get('logout')
	logout(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(user, res);
	}
}
