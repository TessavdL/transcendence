import { Injectable, StreamableFile } from '@nestjs/common';
import { ActivityStatus, AllOtherUsers, FriendStatus, User } from '@prisma/client';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestList, UserElement } from './types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService, private authService: AuthService) { }

	async getUserElements(user: User): Promise<UserElement[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(user.intraId);
		const userElements: UserElement[] = await Promise.all(userlist.map(otherUser => this.createUserElement(otherUser, userWithAllOtherUsers)));

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

	async createUserElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User & { allOtherUsers: AllOtherUsers[]; }): Promise<UserElement> {
		const singleElement: UserElement = {
			avatar: otherUser.avatar,
			intraId: otherUser.intraId,
			username: otherUser.name,
			activityStatus: otherUser.activityStatus,
			blockedState: user.allOtherUsers.find(x => x.otherIntraId === otherUser.intraId).blockedStatus,
			friendStatus: user.allOtherUsers.find(x => x.otherIntraId === otherUser.intraId).friendStatus,
		}
		
		return (singleElement);
	}

	async getFriendRequests(user: User): Promise<FriendRequestList[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(user.intraId);
		const friendRequestList: FriendRequestList[] = await Promise.all(userlist.filter(friend => friend.allOtherUsers.find(x => x.friendStatus === 'REQUESTED')).map(otherUser => this.createFriendRequestListElement(otherUser, userWithAllOtherUsers)))

		return (friendRequestList);
	}

	async createFriendRequestListElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User & { allOtherUsers: AllOtherUsers[]; }): Promise<FriendRequestList> {
		const singleElement: FriendRequestList = {
			intraId: otherUser.intraId,
			username: otherUser.intraName,
			avatar: otherUser.avatar,
		}
		
		return (singleElement);
	}

	async blockUser(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserIntraId: number) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					intraId_otherIntraId: {
						intraId: user.intraId,
						otherIntraId: otherUserIntraId,
					}
				},
				data: {
					blockedStatus: true,
				}
			});
		}
		catch (error) {
			throw new Error(error);
		}
	}

	async unblockUser(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserIntraId: number) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					intraId_otherIntraId: {
						intraId: user.intraId,
						otherIntraId: otherUserIntraId,
					}
				},
				data: {
					blockedStatus: false,
				}
			});
		}
		catch (error) {
			throw new Error(error);
		}
	}

	async handleFriendRequest(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserIntraId: number) {
		const otherUser: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(otherUserIntraId);

		if (otherUser.allOtherUsers.find(x => x.otherIntraId === user.intraId).friendStatus === 'REQUESTED') {
			return (this.befriendBothUsers(user, otherUser));
		}
		return (this.setRequestToPending(user, otherUserIntraId));
	}

	async befriendBothUsers(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUser: (User & { allOtherUsers: AllOtherUsers[]; })) {
		try {
			await this.prisma.allOtherUsers.updateMany({
				where: {
					OR: [
						{
							intraId: user.intraId,
							otherIntraId: otherUser.intraId,
						},
						{
							intraId: otherUser.intraId,
							otherIntraId: user.intraId,
						},
					]
				},
				data: {
					friendStatus: 'FRIENDS',
				},
			});
		}
		catch (error) {
			throw new Error(error);
		}
	}

	async setRequestToPending(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserIntraId: number) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					intraId_otherIntraId: {
						intraId: user.intraId,
						otherIntraId: otherUserIntraId,
					},
				},
				data: {
					friendStatus: 'REQUESTED',
				},
			});
			await this.prisma.allOtherUsers.update({
				where: {
					intraId_otherIntraId: {
						intraId: otherUserIntraId,
						otherIntraId: user.intraId,
					},
				},
				data: {
					friendStatus: 'PENDING',
				},
			});
		}
		catch (error) {
			throw new Error(error);
		}
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

	async createDummyUser(): Promise<void> {
		const randomUserName = this.generateString(7);
		const randomIntraId = this.generateNumber(5);

		this.authService.createUser({
			username: randomUserName,
			intraid: randomIntraId,
		});
	}

	private generateString(length: number): string {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = ' ';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}

	private generateNumber(length: number): number {
		const characters = '0123456789';
		let result = ' ';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return parseInt(result);
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

	async getUserElementBasedOnIntraId(user: User, otherIntraId: number): Promise<UserElement> {
		const otherUser: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(otherIntraId);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserBasedOnIntraId(user.intraId);
		const userElement: UserElement = await this.createUserElement(otherUser, userWithAllOtherUsers);

		return (userElement);
	}

	getAvatar(avatar: string): StreamableFile {
		const file = createReadStream(join(process.cwd(), avatar));
		return new StreamableFile(file);
	}

	async uploadAvatar(id: number, filePath: string): Promise<void> {
		await this.prisma.user.update({
			where: { id: id },
			data: { avatar: filePath },
		});
	}
}
