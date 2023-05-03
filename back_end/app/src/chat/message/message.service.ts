import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '../types';
import { Channel, User, UserMessage } from '@prisma/client';

@Injectable()
export class MessageService {
	constructor(private readonly prisma: PrismaService) { }

	// check if it is still used
	// could have been replaced by getfilteredmessages entirely
	// remove?
	async getMessages(channelName: string): Promise<Message[]> {
		try {
			const channel: Channel & { userMessages: (UserMessage & { user: { intraId: number; name: string; avatar: string; }; })[]; } = await this.prisma.channel.findUnique({
				where: {
					channelName: channelName,
				},
				include: {
					userMessages: {
						include: {
							user: {
								select: {
									intraId: true,
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
				intraId: mes.intraId,
				name: mes.user.name,
				avatar: mes.user.avatar,
				text: mes.text,
			}));
			return messages;
		} catch (error: any) {
			throw new BadRequestException(`Cannot find messages in ${channelName}`);
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

		const otherUsers: { intraId: number, blockedStatus: boolean; otherIntraId: number; }[] = await this.prisma.allOtherUsers.findMany({
			where: {
				intraId: user.intraId,
			},
			select: {
				intraId: true,
				blockedStatus: true,
				otherIntraId: true,
			},
		});

		const filteredMessages: Message[] = [];

		messages.forEach((message) => {
			const messageIntraId: number = message.user.intraId;

			const goodUser = otherUsers.find((user) => {
				return (user.intraId === user.intraId && user.otherIntraId === messageIntraId && user.blockedStatus === false);
			});
			if (messageIntraId === user.intraId || goodUser) {
				filteredMessages.push({
					channelName: channelName,
					intraId: message.intraId,
					name: message.user.name,
					avatar: message.user.avatar,
					text: message.text,
				});
			}
		});

		return filteredMessages;
	}

	async handleChannelMessage(intraId: number, channelName: string, text: string): Promise<Message> {
		const user: User = await this.prisma.user.findUnique({ where: { intraId: intraId } });

		const message: Message = {
			channelName: channelName,
			intraId: user.intraId,
			name: user.name,
			avatar: user.avatar,
			text: text,
		};

		try {
			this.addMessageToChannel(user.intraId, channelName, text);
			return (message);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async addMessageToChannel(intraId: number, channelName: string, text: string): Promise<void> {
		const channel = await this.prisma.channel.findUnique({
			where: {
				channelName
			}
		});
		if (!channel) {
			throw new BadRequestException({ reason: `Channel ${channelName} was not found` });
		}

		try {
			await this.prisma.userMessage.create({
				data: {
					text: text,
					channel: {
						connect: { channelName },
					},
					user: {
						connect: { intraId },
					}
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to create message');
		}
	}
}
