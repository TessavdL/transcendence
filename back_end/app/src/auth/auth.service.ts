import { Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AllOtherUsers, User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) { }
	private readonly logger: Logger = new Logger('AuthService');

	async validateUser(profile: any): Promise<User> | null {
		const user: User = await this.findUserById(profile.intraid);
		if (!user) {
			return this.createUser(profile);
		}

		return user;
	}

	// should be used to user module
	async findUserById(id: number): Promise<User> | null {
		const user: User = await this.prisma.user.findUnique({
			where: {
				intraId: id,
			},
		});

		return user;
	}

	async setBearerToken(
		user: User,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		console.log(`Hello ${user.intraName}, you have logged in!`);

		const token = await this.signToken(user);

		res.cookie('jwt', token.access_token, {
			httpOnly: true,
			domain: 'localhost',
		});
		res.redirect('http://localhost:5173');
	}

	async signToken(user: User): Promise<{ access_token: string }> {
		const payload = { name: user.intraName, sub: user.intraId };

		return {
			access_token: await this.jwtService.signAsync(payload, {
				expiresIn: '24h',
				secret: this.configService.get('JWT_SECRET'),
			}),
		};
	}

	getJwtTokenFromSocket(client: Socket): string {
		const { headers } = client.handshake;
		const allCookies = headers?.cookie;

		if (!allCookies) {
			throw new Error('Could not find cookies');
		}

		const jwtCookie = allCookies
			.split(';')
			.map((cookie: string) => cookie.trim())
			.find((cookie: string) => cookie.startsWith('jwt='));

		if (!jwtCookie) {
			throw new Error('Could not find cookie with jwt token');
		}

		const [, token] = jwtCookie.split('=');

		if (!token) {
			throw new Error('Could not find jwt token');
		}

		return token;
	}

	async verifyToken(token: string): Promise<{ name: string; sub: number }> {
		try {
			const secret: string = this.configService.get('JWT_SECRET');

			const payload: any = await this.jwtService.verify(token, {
				secret: secret,
				clockTolerance: 100,
			});

			const name: string = payload.name;
			const sub: number = payload.sub;
			return { name, sub };
		} catch (error) {
			throw new Error('Token is invalid');
		}
	}

	logout(user: User, @Res({ passthrough: true }) res: Response) {
		console.log(`Hello ${user.intraName}, you are logged out!`);

		res.cookie('jwt', '', { httpOnly: true, domain: 'localhost' });
	}

	// should be moved to user module
	async createUser(profile: any): Promise<User> | null {
		const default_avatar: string = this.pick_random_default_avatar();

		const user: User = await this.prisma.user.create({
			data: {
				name: profile.username,
				intraId: profile.intraid,
				intraName: profile.username,
				avatar: default_avatar,
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

	pick_random_default_avatar(): string {
		const avatar_array: string[] = [
			"src/assets/default_avatars/Cody_Christmas1.jpeg",
			"src/assets/default_avatars/Cody_Christmas2.jpeg",
			"src/assets/default_avatars/Cody_Cute.jpeg",
			"src/assets/default_avatars/Cody_Droopy.jpeg",
			"src/assets/default_avatars/Cody_Majestic.jpeg",
			"src/assets/default_avatars/Cody_Outside.jpeg",
			"src/assets/default_avatars/Cody_Pancake.jpeg",
			"src/assets/default_avatars/Cody_Punky.jpeg",
			"src/assets/default_avatars/Cody_Puppy.jpeg",
			"src/assets/default_avatars/Cody_Sad.jpeg",
			"src/assets/default_avatars/Cody_Seal.jpeg",
			"src/assets/default_avatars/Cody_Sleepy.jpeg",
			"src/assets/default_avatars/Cody_Stare.jpeg",
			"src/assets/default_avatars/Cody_Stuffed_Animal.jpeg",
			"src/assets/default_avatars/Cody_Sunset.jpeg",
			"src/assets/default_avatars/Cody_Young.jpeg",
		];
		const random_number = Math.floor(Math.random() * 16);
		return avatar_array[random_number];
	}

	// should be moved to user module and made private
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

	// should be moved to user module and made private
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
					intraId: user.intraId,
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

	// should be moved to user module and made private
	newRelationObject(intraId: number): any {
		return {
			otherIntraId: intraId,
		};
	}
}
