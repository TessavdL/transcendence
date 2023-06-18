import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Punishment } from '../types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Membership, Role } from '@prisma/client';
import { BANMINUTES, BANSECONDS, MUTEMINUTES, MUTESECONDS } from '../constants';

@Injectable()
export class PunishmentService {
	constructor(private readonly prisma: PrismaService) { }

	async canBePunished(intraId: number, otherIntraId: number, channelName: string): Promise<boolean> {
		const memberships: Membership[] = await this.prisma.membership.findMany({
			where: {
				intraId: {
					in: [intraId, otherIntraId],
				},
				channelName: channelName,
			},
		});

		if (!memberships) {
			throw new BadRequestException('Could not find user and otheruser');
		}

		const userRole: Role = memberships.find((member: Membership) => member.intraId === intraId).role;
		const otherUserRole: Role = memberships.find((member: Membership) => member.intraId === otherIntraId).role;

		return this.hasAuthority(userRole, otherUserRole);
	}

	private hasAuthority(userRole: Role, otherUserRole: Role): boolean {
		const rank = {
			OWNER: 3,
			ADMIN: 2,
			MEMBER: 1,
		};

		return rank[userRole] > rank[otherUserRole];
	}

	async banUser(intraId: number, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				data: {
					banStatus: true,
					banTimer: new Date(),
				},
			});

			setTimeout(async () => {
				await this.unbanUser(intraId, channelName);
			},
				60 * BANMINUTES * 1000,
			);
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set banStatus and banTimer');
		}
	}

	async unbanUser(intraId: number, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				data: {
					banStatus: false,
					banTimer: null,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set banStatus and banTimer');
		}
	}

	async muteUser(intraId: number, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				data: {
					muteStatus: true,
					muteTimer: new Date(),
				},
			});

			setTimeout(async () => {
				await this.unmuteUser(intraId, channelName);
			},
				60 * MUTEMINUTES * 1000,
			);
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set muteStatus and muteTimer');
		}
	}

	async unmuteUser(intraId: number, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				data: {
					muteStatus: false,
					muteTimer: null,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set muteStatus and muteTimer');
		}
	}

	async isMemberBanned(intraId: number, channelName: string): Promise<Punishment> {
		try {
			const { banStatus, banTimer }: { banStatus: boolean, banTimer: Date } = await this.prisma.membership.findUnique({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				select: {
					banStatus: true,
					banTimer: true,
				},
			});

			let ban: Punishment;
			if (banStatus === true) {
				const banTime: number = Math.floor(BANSECONDS + ((banTimer.getTime() - new Date().getTime()) / 1000));
				ban = {
					status: banStatus,
					time: banTime,
				};
			}
			else {
				ban = {
					status: false,
					time: null,
				};
			}
			return ban;
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to get ban status and ban time information');
		}
	}

	async isMemberMuted(intraId: number, channelName: string): Promise<Punishment> {
		try {
			const { muteStatus, muteTimer }: { muteStatus: boolean, muteTimer: Date } = await this.prisma.membership.findUnique({
				where: {
					intraId_channelName: { intraId: intraId, channelName: channelName },
				},
				select: {
					muteStatus: true,
					muteTimer: true,
				},
			});

			let mute: Punishment;
			if (muteStatus === true) {
				const muteTime: number = Math.floor(MUTESECONDS - ((Math.floor(new Date().getTime() - muteTimer.getTime())) / 1000));
				mute = {
					status: muteStatus,
					time: muteTime,
				};
			}
			else {
				mute = {
					status: false,
					time: null,
				};
			}
			return mute;
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to get mute status and mute time information');
		}
	}
}
