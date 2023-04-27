import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { JwtAuthGuard } from '../guards';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { TwofaCodeDto } from './dto/twofa-code-dto';

@Controller('twofa')
export class TwofaController {
	constructor(private readonly twofaService: TwofaService) { }

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

	@UseGuards(JwtAuthGuard)
	@Patch('verify')
	verify_code(@GetUser() user: User, @Body() twofaCodeDto: TwofaCodeDto): boolean {
		console.log(twofaCodeDto.code);
		return this.twofaService.isCodeValid(user, twofaCodeDto.code.toString());
	}
}
