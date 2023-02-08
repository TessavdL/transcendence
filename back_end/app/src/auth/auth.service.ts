import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async login (dto: AuthDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				name: dto.name,
			},
		})
		if (!user)
			throw new ForbiddenException('Wrong Username');
		if (user.password !== dto.password)
			throw new ForbiddenException('Wrong Password');
		return (user);
	}

	async register (dto: AuthDto) {
		try {
			const user = await this.prisma.user.create({
				data: {
					name: dto.name,
					password: dto.password,
				}
			})
			return (user);
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002')
					throw new ForbiddenException('Credentials taken');
			}
			throw error;
		}
	}
}
