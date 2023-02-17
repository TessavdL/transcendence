import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(private config: ConfigService, private prisma: PrismaService, private jwtService: JwtService) {}

	async validateUser(profile: any): Promise<User> | null  {
		let user: User;

		user = await this.prisma.user.findUnique({
			where: {
				intraName: profile.username,
			}
		});

		if (!user) {
			return (this.createUser(profile));
		}
		return (user);
	}

	async createUser(profile: any): Promise<User> | null {
		let user: User;

		user = await this.prisma.user.create({
			data: {
				name: profile.username,
				intraId: profile.intraid,
				intraName: profile.username,
			}
		});
		return (user);
	}

	async signToken(user: User): Promise<{access_token: string}> {
		const payload = { name: user.intraName, sub: user.intraId };

		return {
			access_token: await this.jwtService.signAsync(payload, {
				expiresIn: '24h',
				secret:	this.config.get('JWT_SECRET'),
			})
		};
	}
}
