import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Membership, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
	constructor(private readonly prisma: PrismaService) { }

	async getRole(id: string, channelName: string): Promise<Role> {
		try {
			const membership: Membership = await this.prisma.membership.findUnique({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
				},
			});
			return membership.role;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find membership of user with id: ${id} to ${channelName}`);
		}
	}

	async promoteMemberToAdmin(user: User, channelName: string, otherUserId: string): Promise<void> {
		const userRole: Role = await this.getRole(user.id, channelName);
		const otherUserRole: Role = await this.getRole(otherUserId, channelName);
		if (userRole !== 'OWNER') {
			throw new BadRequestException('User is not the owner of the channel and does not have the rights to promote member');
		}
		if (otherUserRole !== 'MEMBER') {
			throw new BadRequestException('Other user their role is not member');
		}
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: otherUserId,
						channelName: channelName,
					},
				},
				data: {
					role: 'ADMIN',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to update membership');
		}
	}

	async demoteAdminToMember(user: User, channelName: string, otherUserId: string): Promise<void> {
		const userRole: Role = await this.getRole(user.id, channelName);
		const otherUserRole: Role = await this.getRole(otherUserId, channelName);
		if (userRole !== 'OWNER') {
			throw new BadRequestException('User is not the owner of the channel and does not have the rights to demote admin');
		}
		if (otherUserRole !== 'ADMIN') {
			throw new BadRequestException('Other user their role is not admin');
		}

		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: otherUserId,
						channelName: channelName,
					},
				},
				data: {
					role: 'MEMBER',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to update memberhsip');
		}
	}
}
