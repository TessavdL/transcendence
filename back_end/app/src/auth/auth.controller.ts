import { All, Controller, Get, Post, Body, NotFoundException, ForbiddenException, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoginDto, SignupDto } from './dto';



@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
	) { }

	@Post("login")
	async login(@Body loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const user: User = this.authService.findUserByName(loginDto.name);
		if (!user) {
			throw ForbiddenException({ message: "Invalid credentials" });
		}
		const validPassword: boolean = await this.authService.checkPassword(loginDto.name, loginDto.password);
		if (validPassword === false) {
			throw ForbiddenException({ message: "Invalid credentials" });
		}
		return this.authService.setBearerToken(user, res);
	}

	@Post("signup")
	async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const user: User = await this.authService.createUser(signupDto.name, signupDto.password);
		return this.authService.setBearerToken(user, res);
	}

	@UseGuards(JwtAuthGuard)
	@Get('logout')
	logout(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(user, res);
	}

	@UseGuards(JwtAuthGuard)
	@All('*')
	handleWildcard() {
	  throw new NotFoundException('Endpoint not found');
	}
}
