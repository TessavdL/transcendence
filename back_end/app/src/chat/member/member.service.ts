import { BadRequestException, Injectable } from '@nestjs/common';
import { Membership, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Member } from '../types';

@Injectable()
export class MemberService {
	constructor(private readonly prisma: PrismaService) { }

	async getMemberWithUser(channelName: string, intraId: number): Promise<(Membership & { user: User; })> {
		try {
			const member: (Membership & { user: User; }) = await this.prisma.membership.findUnique({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				include: {
					user: true,
				},
			});
			return member;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find user`);
		}
	}

	async getMembersWithUser(channelName: string): Promise<(Membership & { user: User; })[]> {
		try {
			const members: (Membership & { user: User; })[] = await this.prisma.membership.findMany({
				where: {
					channelName: channelName,
				},
				include: {
					user: true,
				},
			});
			return members;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find channel: ${channelName} with members`);
		}
	}

	async getMembersInChannel(channelName: string): Promise<Member[]> {
		const membershipsWithUser: (Membership & { user: User; })[] = await this.getMembersWithUser(channelName);
		const members: Member[] = membershipsWithUser.map((member: (Membership & { user: User })) => ({
			intraId: member.user.intraId,
			name: member.user.name,
			avatar: member.user.avatar,
			role: member.role,
		}));
		return members;
	}
}
