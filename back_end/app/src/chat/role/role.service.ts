import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Membership, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
	constructor(private readonly prisma: PrismaService) { }

	async getRole(intraId: number, channelName: string): Promise<Role> {
		try {
			const membership: Membership = await this.prisma.membership.findUnique({
				where: {
					intraId_channelName: {
						intraId: intraId,
						channelName: channelName,
					},
				},
			});
			const role: Role = membership.role;
			return (role);
		} catch (error: any) {
			throw new BadRequestException(`Cannot find membership of user with intraId: ${intraId} to ${channelName}`);
		}
	}

	async promoteMemberToAdmin(user: User, channelName: string, otherIntraId: number): Promise<void> {
		const userRole: Role = await this.getRole(user.intraId, channelName);
		const otherUserRole: Role = await this.getRole(otherIntraId, channelName);
		if (userRole !== 'OWNER') {
			throw new BadRequestException('User is not the owner of the channel and does not have the rights to promote member');
		}
		if (otherUserRole !== 'MEMBER') {
			throw new BadRequestException('Other user their role is not member');
		}
		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: {
						intraId: otherIntraId,
						channelName: channelName,
					},
				},
				data: {
					role: 'ADMIN',
				},
			});
		}
		catch (error: any) {
			throw new InternalServerErrorException('Failed to update membership');
		}
	}

	async demoteAdminToMember(user: User, channelName: string, otherIntraId: number): Promise<void> {
		const userRole: Role = await this.getRole(user.intraId, channelName);
		const otherUserRole: Role = await this.getRole(otherIntraId, channelName);
		if (userRole !== 'OWNER') {
			throw new BadRequestException('User is not the owner of the channel and does not have the rights to demote admin');
		}
		if (otherUserRole !== 'ADMIN') {
			throw new BadRequestException('Other user their role is not admin');
		}

		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: {
						intraId: otherIntraId,
						channelName: channelName,
					},
				},
				data: {
					role: 'MEMBER',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to update memberhsip');
		}
	}
}
