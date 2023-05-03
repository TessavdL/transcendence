import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '../types';
import { Channel, User, UserMessage } from '@prisma/client';

@Injectable()
export class MessageService {
	constructor(private readonly prisma: PrismaService) { }

	async getFilteredMessages(user: User, channelName: string): Promise<Message[]> {
		const messages: (UserMessage & { user: User; })[] = await this.prisma.userMessage.findMany({
			where: {
				channelName: channelName,
			},
			include: {
				user: true,
			},
		});

		const otherUsers: {
			intraId: number;
			blockedStatus: boolean;
			otherIntraId: number;
		}[] = await this.prisma.allOtherUsers.findMany({
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

		messages.forEach((message: (UserMessage & { user: User; })) => {
			const messageIntraId: number = message.user.intraId;

			const goodUser: {
				intraId: number;
				blockedStatus: boolean;
				otherIntraId: number;
			} = otherUsers.find((user: {
				intraId: number;
				blockedStatus: boolean;
				otherIntraId: number;
			}) => {
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
		const user: User = await this.prisma.user.findUnique({
			where: {
				intraId: intraId,
			}
		});

		const message: Message = {
			channelName: channelName,
			intraId: user.intraId,
			name: user.name,
			avatar: user.avatar,
			text: text,
		};

		try {
			this.addMessageToChannel(user.intraId, channelName, text);
			return message;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async addMessageToChannel(intraId: number, channelName: string, text: string): Promise<void> {
		const channel: Channel = await this.prisma.channel.findUnique({
			where: {
				channelName: channelName,
			},
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
