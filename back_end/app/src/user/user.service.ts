import { Injectable } from '@nestjs/common';
import { ActivityStatus, AllOtherUsers, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserElement } from './types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async getUserElements(user: User): Promise<UserElement[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userElements: UserElement[] = await Promise.all(userlist.map(otherUser => this.createUserElement(otherUser, user)));

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

	async createUserElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User): Promise<UserElement> {
		const singleElement: UserElement = {
			avatar: otherUser.avatar,
			username: otherUser.name,
			activityStatus: otherUser.activityStatus,
			blockedState: otherUser.allOtherUsers.find(x => x.otherIntraId === user.intraId).blockedStatus,
			friendStatus: otherUser.allOtherUsers.find(x => x.otherIntraId === user.intraId).friendStatus,
		}

		return (singleElement);
	}

	async getActivityStatus(intraId: number): Promise<ActivityStatus> {
		try {
			const user: User = await this.prisma.user.findUnique({
				where: {
					intraId: intraId,
				},
			});
			return user.activityStatus;
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async setActivityStatus(intraId: number, status: ActivityStatus): Promise<ActivityStatus> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: intraId,
				},
				data: {
					activityStatus: status,
				}
			});
			const user: User = await this.prisma.user.findUnique({
				where: {
					intraId: intraId,
				},
			});
			return (user.activityStatus);
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async getUserBasedOnIntraId(intraId: number): Promise<(User & { allOtherUsers: AllOtherUsers[]; })> {
		try {
			const user: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.prisma.user.findUnique({
				where: {
					intraId: intraId,
				},
				include: {
					allOtherUsers: true,
				},
			});
			return (user);
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async getUserElementBasedOnIntraId(user: User, intraId: number): Promise<UserElement> {
		const otherUser: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(intraId);
		const userElement: UserElement = await this.createUserElement(otherUser, user);

		return (userElement);
	}
}
