import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Punishment } from '../types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Membership, Role } from '@prisma/client';
import { BANMINUTES, BANSECONDS, MUTEMINUTES, MUTESECONDS } from '../constants';

@Injectable()
export class PunishmentService {
	constructor(private readonly prisma: PrismaService) { }

	async canBePunished(id: string, otherUserId: string, channelName: string): Promise<boolean> {
		const memberships: Membership[] = await this.prisma.membership.findMany({
			where: {
				userId: {
					in: [id, otherUserId],
				},
				channelName: channelName,
			},
		});

		if (!memberships) {
			throw new BadRequestException('Could not find user and otheruser');
		}

		const userRole: Role = memberships.find((member: Membership) => member.userId === id).role;
		const otherUserRole: Role = memberships.find((member: Membership) => member.userId === otherUserId).role;

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

	async banUser(id: string, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
				},
				data: {
					banStatus: true,
					banTimer: new Date(),
				},
			});

			setTimeout(async () => {
				await this.unbanUser(id, channelName);
			},
				60 * BANMINUTES * 1000,
			);
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set banStatus and banTimer');
		}
	}

	async unbanUser(id: string, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
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

	async muteUser(id: string, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName
					},
				},
				data: {
					muteStatus: true,
					muteTimer: new Date(),
				},
			});

			setTimeout(async () => {
				await this.unmuteUser(id, channelName);
			},
				60 * MUTEMINUTES * 1000,
			);
		} catch (error: any) {
			throw new InternalServerErrorException('Failed to set muteStatus and muteTimer');
		}
	}

	async unmuteUser(id: string, channelName: string): Promise<void> {
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
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

	async isMemberBanned(id: string, channelName: string): Promise<Punishment> {
		try {
			const { banStatus, banTimer }: { banStatus: boolean, banTimer: Date } = await this.prisma.membership.findUnique({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
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

	async isMemberMuted(id: string, channelName: string): Promise<Punishment> {
		try {
			const { muteStatus, muteTimer }: { muteStatus: boolean, muteTimer: Date } = await this.prisma.membership.findUnique({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName
					},
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
