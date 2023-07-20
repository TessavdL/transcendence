import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Channel, ChannelMode, ChannelType, Membership, Role, User } from '@prisma/client';
import { DMChannel } from '../types';
import { RoleService } from '../role/role.service';

@Injectable()
export class ChannelService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly roleService: RoleService,
	) { }

	async createChannel(channelMode: ChannelMode, channelName: string, id: string): Promise<string> {
		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel) {
			throw new BadRequestException('Channel already exists');
		}

		try {
			const newChannel = await this.prisma.channel.create({
				data: {
					channelMode: channelMode,
					channelName: channelName,
					channelType: 'NORMAL',
					password: '',
					memberships: {
						create: {
							role: 'OWNER',
							user: {
								connect: {
									id: id
								},
							},
						},
					},
				},
			});
			return newChannel.channelName;
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to create channel');
		}
	}

	async createDMChannel(user: User, otherUserId: string): Promise<string> {
		const getChannelName = (id: string, otherUserId: string): string => {
			let members: string[] = [user.id, otherUserId];
			members = members.sort();
			return `${members[0]}&${members[1]}`;
		}
		const channelName: string = getChannelName(user.id, otherUserId);

		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel) {
			throw new BadRequestException('Channel already exists');
		}

		try {
			await this.prisma.channel.create({
				data: {
					channelMode: 'PRIVATE',
					channelName: channelName,
					channelType: 'DM',
					memberships: {
						create: {
							user: {
								connect: {
									id: user.id,
								},
							},
						},
					},
				},
			});
			await this.addUserToChannel(otherUserId, channelName);
			return channelName;
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to create dmchannel');
		}
	}

	async addUserToChannel(id: string, channelName: string): Promise<void> {
		const channel: Channel = await this.getChannel(channelName);
		if (!channel) {
			throw new BadRequestException(`Channel ${channelName} was not found`);
		}

		const isInChannel: boolean = !!await this.prisma.membership.findFirst({
			where: {
				userId: id,
				channelName: channelName,
			},
		});
		if (isInChannel === true) {
			throw new BadRequestException(`User is already a member of ${channelName}`);
		}

		try {
			await this.prisma.membership.create({
				data: {
					user: {
						connect: {
							id: id,
						},
					},
					channel: {
						connect: {
							channelName: channelName,
						}
					},
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to create membership')
		}
	}

	async removeUserFromChannel(id: string, channelName: string): Promise<void> {
		try {
			const role: Role = await this.roleService.getRole(id, channelName);
			const count: number = await this.getAmountOfMembersInChannel(channelName);
			if (count === 1) {
				return this.deleteChannel(channelName);
			}
			await this.prisma.membership.delete({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					}
				}
			});
			if (role === 'OWNER') {
				return this.transferOwnership(channelName);
			}
		} catch (error: any) {
			throw new InternalServerErrorException(`Prisma failed to delete membership of ${channelName}`);
		}
	}

	async getChannel(channelName: string): Promise<Channel> {
		try {
			const channel: Channel = await this.prisma.channel.findUnique({
				where: {
					channelName: channelName,
				},
			});
			return channel;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find channel: ${channelName}`);
		}
	}

	async getAllChannels(): Promise<Channel[]> {
		try {
			const channels: Channel[] = await this.prisma.channel.findMany({});
			return channels;
		} catch (error: any) {
			throw new BadRequestException('Cannot find channels');
		}
	}

	async getMyChannels(user: User): Promise<Channel[]> {
		try {
			const memberships: { channelName: string; }[] = await this.prisma.membership.findMany({
				where: {
					userId: user.id,
				},
				select: {
					channelName: true,
				}
			});

			const channels: Channel[] = await Promise.all(
				memberships.map((membership) =>
					this.prisma.channel.findUnique({ where: { channelName: membership.channelName } })
				)
			);
			return channels;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find ${user.name}'s channels`);
		}
	}

	async getMyDMChannelsWithUser(user: User): Promise<DMChannel[]> {
		try {
			const channelsWithMemberships: (Channel & { memberships: (Membership & { user: User; })[]; })[] =
				await this.prisma.channel.findMany({
					where: {
						channelType: 'DM',
						memberships: {
							some: {
								userId: user.id,
							},
						},
					},
					include: {
						memberships: {
							where: {
								NOT: {
									userId: user.id,
								},
							},
							include: {
								user: true,
							},
						},
					},
				});

			const DMChannels: DMChannel[] = channelsWithMemberships.map((channel) => {
				const otherUser = channel.memberships[0]?.user;

				return {
					channel,
					otherUser: otherUser,
					user: user,
				};
			});
			return DMChannels;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find ${user.name}'s direct messages`);
		}
	}

	async getChannelType(channelName: string): Promise<ChannelType> {
		try {
			const channel: Channel = await this.getChannel(channelName);
			return channel.channelType;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find type of channel: ${channelName}`);
		}
	}

	private async deleteChannel(channelName: string): Promise<void> {
		try {
			await this.prisma.channel.delete({
				where: {
					channelName: channelName,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	private async getAmountOfMembersInChannel(channelName: string) {
		try {
			const count: number = await this.prisma.membership.count({
				where: {
					channelName: channelName,
				},
			});
			return count;
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to count memberships");
		}
	}

	private async transferOwnership(channelName: string): Promise<void> {
		try {
			let member: Membership = await this.prisma.membership.findFirst({
				where: {
					channelName: channelName,
					role: 'ADMIN',
				},
			});
			if (!member) {
				member = await this.prisma.membership.findFirst({
					where: {
						channelName: channelName,
					},
				});
			}
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						userId: member.userId,
						channelName: channelName,
					},
				},
				data: {
					role: 'OWNER',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to update ownership");
		}
	}
}
