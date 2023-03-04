import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AllOtherUsers, User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(private config: ConfigService, private prisma: PrismaService, private jwtService: JwtService) {}

	async validateUser(profile: any): Promise<User> | null  {
		const user: User = await this.findUserById(profile.intraid);

		if (!user) {
			return (this.createUser(profile));
		}

		return (user);
	}

	async findUserById(id: number): Promise<User> | null {
		const user: User = await this.prisma.user.findUnique({
			where: {
				intraId: id
			},
			include: {
				allOtherUsers: true,
			},
		});

		return (user);
	}

	async createUser(profile: any): Promise<User> | null {
		const user: User = await this.prisma.user.create({
			data: {
				name: profile.username,
				intraId: profile.intraid,
				intraName: profile.username,
				allOtherUsers: {
					create: [],
				},
			},
			include: {
				allOtherUsers: true,
			},
		});
        this.updateUsersOfNewUser(user.intraId);
		this.updateSelfWithOtherUsers(user.intraId);

		return (user);
	}

	async updateSelfWithOtherUsers(intraId: number) {
		const userlist: User[] = await this.prisma.user.findMany({
			where: {
				NOT: {
					intraId: intraId,
				}
			}
		});

		const intraIds: number[] = userlist.map(userlist => userlist.intraId);
		let relationArray: AllOtherUsers[] = [];

		intraIds.forEach((value: number) => {
			const otherUser = this.newRelationObject(value);
			relationArray.push(otherUser);
		});

		await this.prisma.user.update({
			where: { intraId: intraId },
			data: {
				allOtherUsers: {
					create: relationArray,
				},
			},
			include: {
				allOtherUsers: true,
			},
		});
	}

	async updateUsersOfNewUser(intraId: number) {
		const usersToUpdate = await this.prisma.user.findMany({
		  where: {
			intraId: {
			  not: intraId,
			},
		  },
		  include: {
			allOtherUsers: true,
		  },
		});
		const newRelationObject = this.newRelationObject(intraId)
	  
		const promises = usersToUpdate.map(async (user) => {
		  await this.prisma.user.update({
			where: {
			  id: user.id,
			},
			data: {
			  allOtherUsers: {
				create: newRelationObject
			  },
			},
		  });
		});
	  
		await Promise.all(promises);
	  }

	  newRelationObject(intraId: number): any {
		return {
		  intraId: intraId,
		};
	  }

	async setBearerToken(user: User, @Res({ passthrough:true }) res: Response): Promise<void> {
		console.log(`Hello ${user.intraName}, you have logged in!`);
		
		const token = await this.signToken(user);
		
		res.cookie('jwt', token.access_token, { httpOnly:true, domain:'localhost' });
		res.redirect('http://localhost:5173');
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

	logout(user: User, @Res({ passthrough:true }) res: Response) {
		console.log(`Hello ${user.intraName}, you are logged out!`);

		res.cookie('jwt', '', { httpOnly:true, domain:'localhost' });
		// TO DO: needs to redirect to login page
		res.redirect('http://localhost:5173');
	}
}
