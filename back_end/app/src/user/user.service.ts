import { Injectable } from '@nestjs/common';
import { AllOtherUsers, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { userElement } from './types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserElements(user: User): Promise<userElement[]> {
		const userlist: User[] = await this.getUserListExceptSelf(user);
		const userElements: userElement[] = await Promise.all(userlist.map(otherUser => this.createUserElement(otherUser, user)));

		return (userElements);
	}

	async getUserListExceptSelf(user: User): Promise<User[]> {
		const userlist: User[] = await this.prisma.user.findMany({
			where: {
				NOT: {
					intraId: user.intraId,
				},
			},
			include: {
				allOtherUsers: true,
			},
		});

		return (userlist);
	}

	async createUserElement(otherUser: User, self: User): Promise<userElement> {
		const relationStatus: AllOtherUsers = await this.prisma.allOtherUsers.findUnique({
			where: {
				intraId: otherUser.intraId
			}
		})

		const singleElement: userElement = {
			avatar: otherUser.avatar,
			username: otherUser.name,
			activityStatus: otherUser.activityStatus,
			blockedState: relationStatus.blockedStatus,
			friendStatus: relationStatus.friendStatus,
		}

		return (singleElement);
	}
}
