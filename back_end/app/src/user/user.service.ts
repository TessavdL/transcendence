import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { userElement, FriendState, ActivityStatus } from './types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async createUserElement(user: User): Promise<userElement> {
		let singleElement: userElement = {
			avatar: "thisimage.png",
			username: user.name,
			activityStatus: ActivityStatus.ONLINE,
			blockedState: false,
			friendState: FriendState.FRIENDS,
		}

		return (singleElement);
	}

	async getUserElements(user: User): Promise<userElement[]> {
		const userlist: User[] = await this.getUserListExceptSelf(user);
		let userElementList: userElement[] = [];

		for (let it: number = 0; userlist[it]; ++it) {
			userElementList.push(await this.createUserElement(userlist[it]));
		}

		return (userElementList);
	}

	async getUserListExceptSelf(user: User): Promise<User[]> {
		const userlist: User[] = await this.prisma.user.findMany({
			where: {
				NOT: {
					intraId: user.intraId,
				}
			}
		});
 
		return (userlist);
	}
}
