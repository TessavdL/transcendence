import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Channel, Membership, User, UserMessage, ChannelType, ChannelMode, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { UserClientService } from 'src/user/client/client.service';
import { WsException } from '@nestjs/websockets';
import { Messages } from './types';
import * as argon2 from "argon2";

@Injectable()
export class ChatService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userClientService: UserClientService
	) { }

	private readonly logger: Logger = new Logger('UserService initialized');

	async createChannel(channelMode: ChannelMode, channelName: string, password: string, intraId: number): Promise<string> {
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
									intraId: intraId
								},
							},
						},
					},
				},
			});
			return (newChannel.channelName);
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async addUserToChannel(intraId: number, channelName: string): Promise<void> {
		try {
			const channel: Channel = await this.getChannel(channelName);
			if (!channel) {
				throw new HttpException({ reason: `Channel ${channelName} was not found` }, HttpStatus.BAD_REQUEST);
			}

			const isInChannel: boolean = !!await this.prisma.membership.findFirst({
				where: {
					intraId: intraId,
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
							intraId: intraId,
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

	async createDMChannel(user: User, otherIntraId: number): Promise<string> {
		const getChannel = (intraId: number, otherIntraId: number): string => {
			let members: string[] = [intraId.toString(), otherIntraId.toString()];
			members = members.sort();
			return (`${members.at(0)}&${members.at(1)}`);
		}
		const channelName: string = getChannel(user.intraId, otherIntraId);

		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: 'Channel already exists' }, HttpStatus.BAD_REQUEST);

		try {
			const newChannel = await this.prisma.channel.create({
				data: {
					channelMode: 'PRIVATE',
					channelName: channelName,
					channelType: 'DM',
					memberships: {
						create: {
							user: {
								connect: {
									intraId: user.intraId
								},
							},
						},
					},
				},
			});
			this.addUserToChannel(otherIntraId, channelName);
			return channelName;
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async getChannel(channelName: string): Promise<Channel> | null {
		try {
			const channel: Channel = await this.prisma.channel.findUnique({
				where: {
					channelName: channelName,
				},
			});
			return channel;
		} catch (error) {
			this.logger.log(error);
			return null;
		}
	}

	async getAllChannels(): Promise<Channel[]> {
		try {
			const channels: Channel[] = await this.prisma.channel.findMany({});
			return channels;
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async getMyChannels(user: User): Promise<Channel[]> | null {
		try {
			const memberships: { channelName: string }[] = await this.prisma.membership.findMany({
				where: {
					intraId: user.intraId,
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
		} catch (error) {
			this.logger.log(error);
			return null;
		}
	}

	async getAllMessagesInChannel(channelName: string): Promise<UserMessage[]> {
		try {
			const channel: Channel & { userMessages: UserMessage[]; } = await this.prisma.channel.findUnique({
				where: {
					channelName: channelName,
				},
				include: {
					userMessages: true,
				}
			});
			return channel.userMessages;
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async handleChannelMessage(client: Socket, channelName: string, text: string): Promise<Messages> {
		const intraId: number = await this.userClientService.getClientIntraId(client.id);
		if (!intraId)
			throw new WsException({ reason: `Client is invalid` });

		const user: User = await this.prisma.user.findUnique({
			where: {
				intraId: intraId,
			},
		});

		if (!user) {
			throw new WsException({ reason: `Client is invalid` });
		}

		const message: Messages = {
			intraId: intraId,
			name: user.name,
			text: text,
		};

		try {
			this.addMessageToChannel(intraId, channelName, user.name, text);
			return (message);
		} catch (error) {
			throw new WsException(error.message);
		}
	}

	async addMessageToChannel(intraId: number, channelName: string, name: string, text: string): Promise<void> {
		const channel = await this.prisma.channel.findUnique({ where: { channelName } });
		if (!channel) {
			throw new HttpException({ reason: `Channel ${channelName} was not found` }, HttpStatus.BAD_REQUEST);
		}

		try {
			await this.prisma.userMessage.create({
				data: {
					intraId: intraId,
					name: name,
					text: text,
					channel: {
						connect: { channelName },
					},
				},
			});
		} catch (error) {
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
		if (await this.getRole(user, channelName) !== 'OWNER') {
			throw new HttpException('User is not the owner of the channel and does not have the rights to change password', HttpStatus.BAD_REQUEST);
		}
		if (await this.getChannelType(channelName) === 'DM') {
			throw new HttpException('Channel is a direct message and cannot have a password', HttpStatus.BAD_REQUEST);
		}
		if (password !== '' && await this.checkPassword(channelName, password) === false) {
			throw new HttpException('Old password is not correct', HttpStatus.BAD_REQUEST);
		}
	}

	private async getRole(user: User, channelName: string): Promise<Role> {
		try {
			const membership: Membership = await this.prisma.membership.findFirst({
				where: {
					channelName: channelName,
					user: {
						intraId: user.intraId,
					},
				},
			});
			const role: Role = membership.role;
			return (role);
		} catch (error: any) {
			throw new InternalServerErrorException();
		}
	}

	private async getChannelType(channelName): Promise<ChannelType> {
		try {
			const channel: Channel = await this.getChannel(channelName);
			return (channel.channelType);
		} catch (error: any) {
			throw new InternalServerErrorException();
		}
	}

	private async createHashedPassword(password: string): Promise<string> {
		const hashed_password: string = await argon2.hash(password);
		return (hashed_password);
	}
}
