import { Injectable } from '@nestjs/common';
import { AllOtherUsers, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { userElement } from './types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserElements(user: User): Promise<userElement[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userElements: userElement[] = await Promise.all(userlist.map(otherUser => this.createUserElement(otherUser, user)));

		return (userElements);
	}

	async getUserListExceptSelf(user: User): Promise<(User & { allOtherUsers: AllOtherUsers[]; })[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.prisma.user.findMany({
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

	async createUserElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User): Promise<userElement> {
		const singleElement: userElement = {
			avatar: otherUser.avatar,
			intraId: otherUser.intraId,
			username: otherUser.name,
			activityStatus: otherUser.activityStatus,
			blockedState: otherUser.allOtherUsers.find(x => x.otherIntraId === user.intraId).blockedStatus,
			friendStatus: otherUser.allOtherUsers.find(x => x.otherIntraId === user.intraId).friendStatus,
		}

		return (singleElement);
	}

	async blockUser(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUser: number) {
		try {
			await this.prisma.user.update({
				where: {
					intraId: user.intraId
				},
				data: {
					allOtherUsers: {
					
					}
				}
			});
		}
		catch(error) {

		}
	}
}
