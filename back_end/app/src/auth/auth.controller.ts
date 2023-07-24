import { All, Controller, Get, Post, Body, NotFoundException, ForbiddenException, Res, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoginDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
	) { }

	@Post("login")
	async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const user: User = await this.authService.findUserByName(loginDto.name);
		if (!user) {
			throw new UnauthorizedException({ message: "Invalid credentials" });
		}
		const validPassword: boolean = await this.authService.checkPassword(user, loginDto.password);
		if (validPassword === false) {
			throw new UnauthorizedException({ message: "Invalid credentials" });
		}
		return this.authService.setBearerToken(user, res);
	}

	@Post("signup")
	async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const user: User = await this.authService.createUser(signupDto.name, signupDto.password);
	}

	@Get('logout')
	logout(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(user, res);
	}

	@All('*')
	handleWildcard() {
		throw new NotFoundException('Endpoint not found');
	}
}
