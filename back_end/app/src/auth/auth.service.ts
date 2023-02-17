import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async validateUser(profile: any): Promise<User> | null  {
		let user: User;

		user = await this.prisma.user.findUnique({
			where: {
				intraId: profile.intraid,
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
}
