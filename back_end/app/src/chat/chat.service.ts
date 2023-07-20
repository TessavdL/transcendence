import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Channel, Membership, User, UserMessage, ChannelType, ChannelMode, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { WsException } from '@nestjs/websockets';
import { Punishment, DMChannel, Member, Message } from './types';
import * as argon2 from "argon2";
import { BANMINUTES, BANSECONDS, MUTEMINUTES, MUTESECONDS } from './constants';
import { ChatSharedService } from './chat.shared.service';

@Injectable()
export class ChatService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly sharedMap: ChatSharedService,
	) { }

	private readonly logger: Logger = new Logger('UserService initialized');

	async createChannel(channelMode: ChannelMode, channelName: string, password: string, id: string): Promise<string> {
		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: `Channel ${channelName} already exists` }, HttpStatus.BAD_REQUEST);

		let hashed_password: string;
		if (password !== null) {
			hashed_password = await this.createHashedPassword(password);
		}
		else {
			hashed_password = '';
		}
		try {
			const newChannel = await this.prisma.channel.create({
				data: {
					channelMode: channelMode,
					channelName: channelName,
					channelType: 'NORMAL',
					password: hashed_password,
					memberships: {
						create: {
							role: 'OWNER',
							user: {
								connect: {
									id: id,
								},
							},
						},
					},
				},
			});
			return (newChannel.channelName);
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async createDMChannel(user: User, otherUserId: string): Promise<string> {
		const getChannel = (id: string, otherUserId: string): string => {
			let members: string[] = [id, otherUserId];
			members = members.sort();
			return (`${members[0]}&${members[1]}`);
		}
		const channelName: string = getChannel(user.id, otherUserId);

		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: 'Channel already exists' }, HttpStatus.BAD_REQUEST);

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
									id: user.id
								},
							},
						},
					},
				},
			});
			await this.addUserToChannel(otherUserId, channelName);
			return channelName;
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async addUserToChannel(id: string, channelName: string): Promise<void> {
		try {
			const channel: Channel = await this.getChannel(channelName);
			if (!channel) {
				throw new HttpException({ reason: `Channel ${channelName} was not found` }, HttpStatus.BAD_REQUEST);
			}

			const isInChannel: boolean = !!await this.prisma.membership.findFirst({
				where: {
					id: id,
					channelName: channelName,
				},
			});
			if (isInChannel === true) {
				throw new HttpException({ reason: `User is already a member of ${channelName}` }, HttpStatus.BAD_REQUEST);
			}

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
			throw new InternalServerErrorException(error.message);
		}
	}

	async removeUserFromChannel(id: string, channelName: string): Promise<void> {
		try {
			const role: Role = await this.getRole(id, channelName);
			const count: number = await this.getAmountOfMembersInChannel(channelName);
			if (count === 1) {
				return (this.deleteChannel(channelName));
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
				return (this.transferOwnership(channelName));
			}
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	private async deleteChannel(channelName: string): Promise<void> {
		try {
			await this.prisma.channel.delete({
				where: {
					channelName: channelName,
				}
			})
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
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
			member = await this.prisma.membership.findFirst({
				where: {
					channelName: channelName,
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
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
			throw new HttpException(`Cannot find channel: ${channelName}`, HttpStatus.BAD_REQUEST);
		}
	}

	async getMemberWithUser(channelName: string, id: string): Promise<(Membership & { user: User; })> {
		try {
			const member: (Membership & { user: User; }) = await this.prisma.membership.findUnique({
				where: {
					userId_channelName: {
						userId: id,
						channelName: channelName,
					},
				},
				include: {
					user: true,
				},
			});
			return member;
		} catch (error: any) {
			throw new HttpException(`Cannot find user`, HttpStatus.BAD_REQUEST);
		}
	}

	async getMembersWithUser(channelName: string): Promise<(Membership & { user: User; })[]> {
		try {
			const members: (Membership & { user: User })[] = await this.prisma.membership.findMany({
				where: {
					channelName: channelName,
				},
				include: {
					user: true,
				},
			});
			return members;
		} catch (error: any) {
			throw new HttpException(`Cannot find channel: ${channelName} with members`, HttpStatus.BAD_REQUEST);
		}
	}

	async getAllChannels(): Promise<Channel[]> {
		try {
			const channels: Channel[] = await this.prisma.channel.findMany({});
			return channels;
		} catch (error: any) {
			throw new HttpException('Cannot find channels', HttpStatus.BAD_REQUEST);
		}
	}

	async getMyChannels(user: User): Promise<Channel[]> {
		try {
			const memberships: { channelName: string }[] = await this.prisma.membership.findMany({
				where: {
					id: user.id,
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
			throw new HttpException(`Cannot find ${user.name}'s channels`, HttpStatus.BAD_REQUEST);
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
								id: user.id,
							},
						},
					},
					include: {
						memberships: {
							where: {
								NOT: {
									id: user.id,
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
			return (DMChannels);
		} catch (error: any) {
			throw new HttpException(`Cannot find ${user.name}'s direct messages`, HttpStatus.BAD_REQUEST);

		}
	}

	async getMessages(channelName: string): Promise<Message[]> {
		try {
			const channel: Channel & { userMessages: (UserMessage & { user: { id: string; name: string; avatar: string; }; })[]; } = await this.prisma.channel.findUnique({
				where: {
					channelName: channelName,
				},
				include: {
					userMessages: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									avatar: true,
								},
							},
						},
					},
				},
			});

			const messages: Message[] = channel.userMessages.map((mes) => ({
				channelName: channelName,
				id: mes.id,
				name: mes.user.name,
				avatar: mes.user.avatar,
				text: mes.text,
				isLink: false,
			}));
			return messages;
		} catch (error: any) {
			throw new HttpException(`Cannot find messages in ${channelName}`, HttpStatus.BAD_REQUEST);
		}
	}

	async getFilteredMessages(user: User, channelName: string): Promise<Message[]> {
		const messages: (UserMessage & { user: User })[] = await this.prisma.userMessage.findMany({
			where: {
				channelName: channelName,
			},
			include: {
				user: true,
			},
		});

		const otherUsers: { id: string, blockedStatus: boolean; otherUserId: string; }[] = await this.prisma.allOtherUsers.findMany({
			where: {
				id: user.id,
			},
			select: {
				id: true,
				blockedStatus: true,
				otherUserId: true,
			},
		});

		const filteredMessages: Message[] = [];

		messages.forEach((message) => {
			const messageid: string = message.user.id;

			const goodUser = otherUsers.find((user) => {
				return (user.id === user.id && user.otherUserId === messageid && user.blockedStatus === false);
			});
			if (messageid === user.id || goodUser) {
				filteredMessages.push({
					channelName: channelName,
					id: message.id,
					name: message.user.name,
					avatar: message.user.avatar,
					text: message.text,
					isLink: false,
				});
			}
		});

		return filteredMessages;
	}

	async handleChannelMessage(id: string, channelName: string, text: string): Promise<Message> {
		const user: User = await this.prisma.user.findUnique({ where: { id: id, } });

		const message: Message = {
			channelName: channelName,
			id: user.id,
			name: user.name,
			avatar: user.avatar,
			text: text,
			isLink: false,
		};

		try {
			this.addMessageToChannel(user.id, channelName, text);
			return (message);
		} catch (error: any) {
			throw new WsException(error.message);
		}
	}

	async addMessageToChannel(id: string, channelName: string, text: string): Promise<void> {
		const channel = await this.prisma.channel.findUnique({
			where: {
				channelName
			}
		});
		if (!channel) {
			throw new HttpException({ reason: `Channel ${channelName} was not found` }, HttpStatus.BAD_REQUEST);
		}

		try {
			await this.prisma.userMessage.create({
				data: {
					text: text,
					channel: {
						connect: { channelName },
					},
					user: {
						connect: { id },
					}
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async checkPassword(channelName: string, password: string): Promise<boolean> {
		try {
			const channel: Channel = await this.getChannel(channelName);

			const hashed_password: string = channel.password;

			return (argon2.verify(hashed_password, password));
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async changePassword(user: User, channelName: string, oldPassword: string, newPassword: string): Promise<void> {
		await this.checkCredentials(user, channelName, oldPassword);

		try {
			const hashed_password = await this.createHashedPassword(newPassword);

			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: hashed_password,
				}
			})
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async deletePasswordAndSetChannelModeToPublic(user: User, channelName: string, password: string): Promise<void> {
		await this.checkCredentials(user, channelName, password);
		try {
			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: '',
					channelMode: 'PUBLIC',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async setPasswordAndSetChannelModeToProtected(user: User, channelName: string, password: string): Promise<void> {
		await this.checkCredentials(user, channelName, '');
		try {
			const hashed_password = await this.createHashedPassword(password);

			await this.prisma.channel.update({
				where: {
					channelName: channelName,
				},
				data: {
					password: hashed_password,
					channelMode: 'PROTECTED',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	private async checkCredentials(user: User, channelName: string, password: string) {
		if (await this.getRole(user.id, channelName) !== 'OWNER') {
			throw new HttpException('User is not the owner of the channel and does not have the rights to change password', HttpStatus.BAD_REQUEST);
		}
		if (await this.getChannelType(channelName) === 'DM') {
			throw new HttpException('Channel is a direct message and cannot have a password', HttpStatus.BAD_REQUEST);
		}
		if (password !== '' && await this.checkPassword(channelName, password) === false) {
			throw new HttpException('Old password is not correct', HttpStatus.BAD_REQUEST);
		}
	}

	private async getAmountOfMembersInChannel(channelName: string) {
		try {
			const count: number = await this.prisma.membership.count({
				where: {
					channelName: channelName,
				},
			});
			return (count);
		} catch (error: any) {
			throw new InternalServerErrorException(error.message);
		}
	}

	private async getRole(id: string, channelName: string): Promise<Role> {
		try {
			const membership: Membership = await this.prisma.membership.findUnique({
				where: {
					userId_channelName: {
						id: id,
						channelName: channelName,
					},
				},
			});
			const role: Role = membership.role;
			return (role);
		} catch (error: any) {
			throw new HttpException(`Cannot find membership of user with id: ${id} to ${channelName}`, HttpStatus.BAD_REQUEST);
		}
	}

	private async getChannelType(channelName: string): Promise<ChannelType> {
		try {
			const channel: Channel = await this.getChannel(channelName);
			return (channel.channelType);
		} catch (error: any) {
			throw new HttpException(`Cannot find type of channel: ${channelName}`, HttpStatus.BAD_REQUEST);
		}
	}

	private async createHashedPassword(password: string): Promise<string> {
		const hashed_password: string = await argon2.hash(password);
		return (hashed_password);
	}

	async getMembersInChannel(channelName: string): Promise<Member[]> {
		const membershipsWithUser: (Membership & { user: User; })[] = await this.getMembersWithUser(channelName);
		const members: Member[] = membershipsWithUser.map((member: (Membership & { user: User })) => ({
			id: member.user.id,
			name: member.user.name,
			avatar: member.user.avatar,
			role: member.role,
		}));
		return members;
	}

	async promoteMemberToAdmin(user: User, channelName: string, otherUserId: string): Promise<void> {
		const userRole: Role = await this.getRole(user.id, channelName);
		const otherUserRole: Role = await this.getRole(otherUserId, channelName);
		if (userRole !== 'OWNER') {
			throw new HttpException('User is not the owner of the channel and does not have the rights to promote member', HttpStatus.BAD_REQUEST);
		}
		if (otherUserRole !== 'MEMBER') {
			throw new HttpException('Other user is not a member', HttpStatus.BAD_REQUEST);
		}
		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						id: otherUserId,
						channelName: channelName,
					},
				},
				data: {
					role: 'ADMIN',
				},
			});
		}
		catch (error: any) {
			throw new InternalServerErrorException();
		}
	}

	async demoteAdminToMember(user: User, channelName: string, otherUserId: string): Promise<void> {
		const userRole: Role = await this.getRole(user.id, channelName);
		const otherUserRole: Role = await this.getRole(otherUserId, channelName);
		if (userRole !== 'OWNER') {
			throw new HttpException('User is not the owner of the channel and does not have the rights to demote admin', HttpStatus.BAD_REQUEST);
		}
		if (otherUserRole !== 'ADMIN') {
			throw new HttpException('Other user is not an admin', HttpStatus.BAD_REQUEST);
		}

		try {
			await this.prisma.membership.update({
				where: {
					userId_channelName: {
						id: otherUserId,
						channelName: channelName,
					},
				},
				data: {
					role: 'MEMBER',
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException();
		}
	}

	async canBePunished(id: string, otherUserId: string, channelName: string): Promise<boolean> {
		const memberships: Membership[] = await this.prisma.membership.findMany({
			where: {
				id: {
					in: [id, otherUserId],
				},
				channelName: channelName,
			},
		});

		if (!memberships) {
			throw new HttpException('Could not find user and otheruser', HttpStatus.BAD_REQUEST);
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
						channelName: channelName,
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
						channelName: channelName,
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

	async getNonBlockedClientIds(senderid: string, senderclientId: string, allClientIds: string[]): Promise<string[]> {
		const nonBlockedClientIds: string[] = [senderclientId];

		const relationships: { id: string; }[] = await this.prisma.allOtherUsers.findMany({
			where: {
				otherUserId: senderid,
				blockedStatus: false,
			},
			select: {
				id: true,
			},
		});

		for (const clientId of allClientIds) {
			const id = this.sharedMap.clientToid.get(clientId);
			if (id && id !== senderid && relationships.some((relationship) => { return relationship.id === id })) {
				nonBlockedClientIds.push(clientId);
			}
		}

		return nonBlockedClientIds;
	}
}
