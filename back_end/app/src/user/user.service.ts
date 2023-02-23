import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserList(user: User) {
		const userlist: User[] = await this.prisma.user.findMany();

		console.log(userlist);
		return (userlist);
	}
}
