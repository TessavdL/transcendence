import { Body, Controller, Get, Patch, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { JwtAuthGuard } from '../guards';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { TwofaCodeDto } from './dto/twofa-code-dto';
import { AuthService } from '../auth.service';
import { Response } from 'express';

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
		console.log(`secret = ${secret}`);
		const qrcodestring: string = this.twofaService.createQRCodeString(user, secret);
		console.log(`qrcodestring = ${qrcodestring}`);
		return await this.twofaService.createQRCodeUrl(qrcodestring);
	}

	@Patch('verify')
	async verify_code(@Body() twofaCodeDto: TwofaCodeDto, @Res({ passthrough: true }) res: Response): Promise<boolean> {
		console.log(twofaCodeDto.code);
		const user: User = await this.authService.findUserById(twofaCodeDto.intraId);
		const isValid = this.twofaService.isCodeValid(user, twofaCodeDto.code);

		if (isValid === false) {
			throw new UnauthorizedException('Code was not valid');
		}

		if (await this.twofaService.getTwofaStatus(user) === false) {
			await this.set_twofa_status_to_true(user);
			await this.authService.setBearerTokenForTwofa(user, res);
		}

		return true;
	}
}
