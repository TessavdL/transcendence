import { Body, Controller, Get, Patch, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { JwtAuthGuard } from '../guards';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import { TwofaAuthenticateDto, TwofaCodeDto } from './dto';

@Controller('twofa')
export class TwofaController {
	constructor(private readonly twofaService: TwofaService, private readonly authService: AuthService) { }

	@UseGuards(JwtAuthGuard)
	@Get('status')
	async get_twofa_status(@GetUser() user: User): Promise<boolean> {
		return await this.twofaService.getTwofaStatus(user);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('off')
	async set_twofa_status_to_false(@GetUser() user: User): Promise<void> {
		return await this.twofaService.setTwofaStatus(user, false);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('on')
	async set_twofa_status_to_true(@GetUser() user: User): Promise<void> {
		return await this.twofaService.setTwofaStatus(user, true);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('enable')
	async enable_twofa(@GetUser() user: User): Promise<string> {
		const secret = await this.twofaService.setAndReturnTwofaSecret(user);
		const qrcodestring: string = this.twofaService.createQRCodeString(user, secret);
		return await this.twofaService.createQRCodeUrl(qrcodestring);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('verify')
	async verify_code(@GetUser() user: User, @Body() twofaCodeDto: TwofaCodeDto): Promise<boolean> {
		const isValid = this.twofaService.isCodeValid(user, twofaCodeDto.code);
		if (isValid === false) {
			throw new UnauthorizedException('Two factor authentication failed: Code was not valid');
		}

		await this.twofaService.setTwofaStatus(user, true);
		return true;
	}

	@Patch('authenticate')
	async verify_code_from_login(@Body() twofaAuthenticateDto: TwofaAuthenticateDto, @Res({ passthrough: true }) res: Response): Promise<boolean> {
		const user: User = await this.authService.findUserById(twofaAuthenticateDto.intraId);
		if (!user) {
			throw new UnauthorizedException('Two factor authentication failed: Unknown user');
		}

		const isValid = this.twofaService.isCodeValid(user, twofaAuthenticateDto.code);
		if (isValid === false) {
			throw new UnauthorizedException('Two factor authentication failed: Code could not be verified');
		}

		await this.authService.setBearerTokenForTwofa(user, res);
		return true;
	}
}
