import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async findOrCreate(profile: any) {
		let user = await this.prisma.user.findUnique({
			where: {
				intraId: profile.intraid,
			}
		})

		if (!user) {
			user = await this.createUser(profile);
		}
		if (!user) {
			console.log("user still no exists");
		}
		return (user);
	}

	async createUser(profile: any) {
		const user = await this.prisma.user.create({
			data: {
				name: profile.username,
				intraId: profile.intraid,
				intraName: profile.username,
			}
		})
		return (user);
	}
}
