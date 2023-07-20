import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { Prisma, Achievements, ActivityStatus, AllOtherUsers, FriendStatus, User, MatchHistory } from '@prisma/client';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestList, UserElement } from './types';
import { AchievementsService } from 'src/achievements/achievements.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService, private authService: AuthService, private achievementsService: AchievementsService) { }

	async getUserWithAchievements(user: User): Promise<(User & { achievements: Achievements })> {
		try {
			const return_user = await this.prisma.user.findUnique({
				where: {
					id: user.id,
				},
				include: {
					achievements: true,
				}
			})
			return (return_user);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async getUserElements(user: User): Promise<UserElement[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserWithAllOtherUsers(user.id);
		const userElements: UserElement[] = await Promise.all(userlist.map(otherUser => this.createUserElement(otherUser, userWithAllOtherUsers)));

		return (userElements);
	}

	async getUserListExceptSelf(user: User): Promise<(User & { allOtherUsers: AllOtherUsers[]; })[]> {
		try {
			const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.prisma.user.findMany({
				where: {
					NOT: {
						id: user.id,
					},
				},
				include: {
					allOtherUsers: true,
				},
			});
			return (userlist);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async createUserElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User & { allOtherUsers: AllOtherUsers[]; }): Promise<UserElement> {
		const singleElement: UserElement = {
			avatar: otherUser.avatar,
			id: otherUser.id,
			name: otherUser.name,
			activityStatus: otherUser.activityStatus,
			blockedState: user.allOtherUsers.find(x => x.otherUserId === otherUser.id).blockedStatus,
			friendStatus: user.allOtherUsers.find(x => x.otherUserId === otherUser.id).friendStatus,
		}

		return (singleElement);
	}

	async getFriendRequests(user: User): Promise<FriendRequestList[]> {
		const userlist: (User & { allOtherUsers: AllOtherUsers[]; })[] = await this.getUserListExceptSelf(user);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserWithAllOtherUsers(user.id);
		const friendRequestList: FriendRequestList[] = await Promise.all(userlist.filter(friend => friend.allOtherUsers.find(x => x.friendStatus === 'REQUESTED')).map(otherUser => this.createFriendRequestListElement(otherUser, userWithAllOtherUsers)))

		return (friendRequestList);
	}

	async createFriendRequestListElement(otherUser: (User & { allOtherUsers: AllOtherUsers[]; }), user: User & { allOtherUsers: AllOtherUsers[]; }): Promise<FriendRequestList> {
		const singleElement: FriendRequestList = {
			id: otherUser.id,
			name: otherUser.name,
			avatar: otherUser.avatar,
		}

		return (singleElement);
	}

	async blockUser(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserId: string) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					userId_otherUserId: {
						userId: user.id,
						otherUserId: otherUserId,
					}
				},
				data: {
					blockedStatus: true,
				}
			});
		}
		catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User to block not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async unblockUser(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserId: string) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					userId_otherUserId: {
						userId: user.id,
						otherUserId: otherUserId,
					}
				},
				data: {
					blockedStatus: false,
				}
			});
		}
		catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User to unblock not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async handleFriendRequest(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserId: string) {
		const otherUser: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserWithAllOtherUsers(otherUserId);

		if (otherUser.allOtherUsers.find(x => x.otherUserId === user.id).friendStatus === 'REQUESTED') {
			return (this.befriendBothUsers(user, otherUser));
		}
		return (this.setRequestToPending(user, otherUserId));
	}

	async befriendBothUsers(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUser: (User & { allOtherUsers: AllOtherUsers[]; })) {
		try {
			await this.prisma.allOtherUsers.updateMany({
				where: {
					OR: [
						{
							id: user.id,
							otherUserId: otherUser.id,
						},
						{
							id: otherUser.id,
							otherUserId: user.id,
						},
					]
				},
				data: {
					friendStatus: 'FRIENDS',
				},
			});
		}
		catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User to befriend not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async setRequestToPending(user: (User & { allOtherUsers: AllOtherUsers[]; }), otherUserId: string) {
		try {
			await this.prisma.allOtherUsers.update({
				where: {
					userId_otherUserId: {
						id: user.id,
						otherUserId: otherUserId,
					},
				},
				data: {
					friendStatus: 'REQUESTED',
				},
			});
			await this.prisma.allOtherUsers.update({
				where: {
					userId_otherUserId: {
						id: otherUserId,
						otherUserId: user.id,
					},
				},
				data: {
					friendStatus: 'PENDING',
				},
			});
		}
		catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User to friend request not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async getActivityStatus(id: string): Promise<ActivityStatus> {
		try {
			const user: User = await this.prisma.user.findUnique({
				where: {
					id: id,
				},
			});
			return user.activityStatus;
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async setActivityStatus(id: string, status: ActivityStatus): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					id: id,
				},
				data: {
					activityStatus: status,
				}
			});
			const user: User = await this.prisma.user.findUnique({
				where: {
					id: id,
				},
			});
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async createDummyUser(): Promise<void> {
		const randomName: string = "dummy" + this.generateString(7);
		const randomPassword: string = "Hello123";
		this.authService.createUser(randomName, randomPassword);
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

	async getUserWithAllOtherUsers(id: string): Promise<(User & { allOtherUsers: AllOtherUsers[]; })> {
		try {
			const user: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.prisma.user.findUnique({
				where: {
					id: id,
				},
				include: {
					allOtherUsers: true,
				},
			});
			return (user);
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('User not found');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async getUserElementBasedOnId(user: User, otherUserId: string): Promise<UserElement> {
		const otherUser: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserWithAllOtherUsers(otherUserId);
		const userWithAllOtherUsers: (User & { allOtherUsers: AllOtherUsers[]; }) = await this.getUserWithAllOtherUsers(user.id);
		const userElement: UserElement = await this.createUserElement(otherUser, userWithAllOtherUsers);

		return (userElement);
	}

	async getOtherUserAchievements(user: User, otherUserId: string): Promise<( User & { achievements: Achievements })> {
		try {
			const return_user: (User & { achievements: Achievements }) = await this.prisma.user.findUnique({
				where: {
					id: otherUserId,
				},
				include: {
					achievements: true,
				}
			})
			return (return_user);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	getAvatar(avatar: string): StreamableFile {
		const file = createReadStream(join(process.cwd(), avatar));
		return new StreamableFile(file);
	}

	async getMatchHistory(id: string): Promise<MatchHistory[]> {
		try {
			const matchHistory: MatchHistory[] = await this.prisma.matchHistory.findMany({
				where: {
					OR: [
						{
							winnerUserId: id,
						},
						{
							loserUserId: id,
						},
					],
				},
			});
			return (matchHistory);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async getLeaderboard(): Promise<User[]> {
		try {
			const userArray: User[] = await this.prisma.user.findMany({
				orderBy: {
					elo: 'desc',
				},
			});
			return (userArray);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async updateName(user: User, name: string) {
		try {
			const updatedUser: (User & { achievements: Achievements }) = await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					name: name,
				},
				include: {
					achievements: true,
				},
			});
			await this.updateNameInMatchHistory(user, name);
			this.achievementsService.checkChangedName(updatedUser);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('Can\'t update username, user doesn\'t exist');
				}
				if (error.code === 'P2002') {
					throw new ForbiddenException(`Username change failed, the following username is already taken: ${name}`);
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async updateNameInMatchHistory(user: User, name: string): Promise<void> {
		try {
			await this.prisma.matchHistory.updateMany({
				where: {
					winnerid: user.id,
				},
				data: {
					winnerName: name,
				}
			});
			await this.prisma.matchHistory.updateMany({
				where: {
					loserid: user.id,
				},
				data: {
					loserName: name,
				}
			});
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async updateAvatar(id: string, filePath: string): Promise<void> {
		try {
			const user: (User & { achievements: Achievements }) = await this.prisma.user.update({
				where: { 
					id: id,
				},
				data: {
					avatar: filePath
				},
				include: {
					achievements: true,
				},
			});
			await this.updateAvatarInMatchHistory(id, filePath);
			await this.achievementsService.checkUploadedAvatar(user);
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2001') {
					throw new NotFoundException('Unable to upload avatar');
				}
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	async updateAvatarInMatchHistory(id: string, filePath: string): Promise<void> {
		try {
			await this.prisma.matchHistory.updateMany({
				where: {
					winnerUserId: id,
				},
				data: {
					winnerAvatar: filePath,
				},
			});
			await this.prisma.matchHistory.updateMany({
				where: {
					loserUserId: id,
				},
				data: {
					loserAvatar: filePath,
				},
			});
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}
}
