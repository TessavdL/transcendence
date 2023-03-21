import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Channel, Membership, User, UserMessage, ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { UserClientService } from 'src/user/client/client.service';
import { WsException } from '@nestjs/websockets';
import { Messages } from './types';

@Injectable()
export class ChatService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userClientService: UserClientService
	) { }

	private readonly logger: Logger = new Logger('UserService initialized');

	async createChannel(channelName: string, intraId: number): Promise<string> {
		const existingChannel: Channel = await this.getChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: `Channel ${channelName} already exists` }, HttpStatus.BAD_REQUEST);
		try {
			const newChannel = await this.prisma.channel.create({
				data: {
					channelName: channelName,
					channelType: 'NORMAL',
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

	// async getDMChannel(channelName: string): Promise<DMChannel> | null {
	// 	try {
	// 		const channel: DMChannel = await this.prisma.dMChannel.findUnique({
	// 			where: {
	// 				channelName: channelName,
	// 			},
	// 		});
	// 		return channel;
	// 	} catch (error) {
	// 		this.logger.log(error);
	// 		return null;
	// 	}
	// }

	// async getDMChannelWithMessages(channelName: string): Promise<(DMChannel & { userMessages: UserMessage[]; }) | null> {
	// 	try {
	// 		const channel: (DMChannel & { userMessages: UserMessage[]; }) = await this.prisma.dMChannel.findUnique({
	// 			where: {
	// 				channelName: channelName,
	// 			},
	// 			include: {
	// 				userMessages: true,
	// 			}
	// 		});
	// 		return channel;
	// 	} catch (error) {
	// 		this.logger.log(error);
	// 		return null;
	// 	}
	// }

	// async getAllDMChannels(): Promise<DMChannel[]> {
	// 	try {
	// 		const channels: DMChannel[] = await this.prisma.dMChannel.findMany({});
	// 		return channels;
	// 	} catch (error) {
	// 		throw new InternalServerErrorException(error.message);
	// 	}
	// }

	// async getMyDMChannels(user: User): Promise<DMChannel[]> | null {
	// 	try {
	// 		const userWithDMChannels: (User & { dMChannel: DMChannel[]; }) = await this.prisma.user.findUnique({
	// 			where: {
	// 				intraId: user.intraId,
	// 			},
	// 			include: {
	// 				dMChannel: true,
	// 			},
	// 		});
	// 		return userWithDMChannels.dMChannel;
	// 	} catch (error) {
	// 		this.logger.log(error);
	// 		return null;
	// 	}
	// }

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

	// async getAllMessagesInDMChannel(channelName: string): Promise<UserMessage[]> {
	// 	try {
	// 		const channel: DMChannel & { userMessages: UserMessage[]; } = await this.prisma.dMChannel.findUnique({
	// 			where: {
	// 				channelName: channelName,
	// 			},
	// 			include: {
	// 				userMessages: true,
	// 			}
	// 		});
	// 		return channel.userMessages;
	// 	} catch (error) {
	// 		throw new InternalServerErrorException(error.message);
	// 	}
	// }

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

	// async addMessageToDMChannel(intraId: number, channelName: string, name: string, text: string): Promise<void> {
	// 	const channel = await this.prisma.dMChannel.findUnique({ where: { channelName } });
	// 	if (!channel) {
	// 		throw new HttpException({ reason: `Channel ${channelName} was not found` }, HttpStatus.BAD_REQUEST);
	// 	}

	// 	try {
	// 		await this.prisma.userMessage.create({
	// 			data: {
	// 				intraId: intraId,
	// 				name: name,
	// 				text: text,
	// 				dMChannel: {
	// 					connect: { channelName },
	// 				},
	// 			},
	// 		});
	// 	} catch (error) {
	// 		throw new InternalServerErrorException(error.message);
	// 	}
	// }
}
