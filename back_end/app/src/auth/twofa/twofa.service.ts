import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { authenticator } from 'otplib'
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwofaService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService
	) { }

	async getTwofaStatus(user: User): Promise<boolean> {
		try {
			const { twofaStatus }: { twofaStatus: boolean } = await this.prisma.user.findUnique({
				where: {
					intraId: user.intraId,
				},
				select: {
					twofaStatus: true,
				},
			});
			return twofaStatus;
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to get twofa status');
		}
	}

	async setTwofaStatus(user: User, status: boolean): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: user.intraId,
				},
				data: {
					twofaStatus: status,
				},
			});

		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to set twofa status');
		}
	}

	async setAndReturnTwofaSecret(user: User): Promise<string> {
		const secret = this.generateTwofaSecret();

		try {
			await this.prisma.user.update({
				where: {
					intraId: user.intraId,
				},
				data: {
					twofaSecret: secret,
				},
			});
			return secret;
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to set twofa secret');
		}
	}

	generateTwofaSecret(): string {
		try {
			return authenticator.generateSecret();
		} catch (error: any) {
			throw new InternalServerErrorException('Authenticator failed to generate secret')
		}
	}

	createQRCodeString(user: User, secret: string): string {
		try {
			const appName: string = this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME')
			return authenticator.keyuri(user.intraName, appName, secret);
		} catch (error: any) {
			throw new InternalServerErrorException('Authenticator failed to make key uri')
		}
	}

	async createQRCodeUrl(otpauthUrl: string): Promise<string> {
		try {
			return await toDataURL(otpauthUrl);
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to create qrcode url')
		}
	}

	isCodeValid(user: User, code: string): boolean {
		return authenticator.verify({
			token: code,
			secret: user.twofaSecret,
		});
	}
}
