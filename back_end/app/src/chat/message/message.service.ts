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
			id: string;
			blockedStatus: boolean;
			otherUserId: string;
		}[] = await this.prisma.allOtherUsers.findMany({
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

		messages.forEach((message: (UserMessage & { user: User; })) => {
			const messageUserId: string = message.user.id;

			const goodUser: {
				id: string;
				blockedStatus: boolean;
				otherUserId: string;
			} = otherUsers.find((user: {
				id: string;
				blockedStatus: boolean;
				otherUserId: string;
			}) => {
				return (user.id === user.id && user.otherUserId === messageUserId && user.blockedStatus === false);
			});
			if (messageUserId === user.id || goodUser) {
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
		const user: User = await this.prisma.user.findUnique({
			where: {
				id: id,
			}
		});

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
			return message;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async addMessageToChannel(id: string, channelName: string, text: string): Promise<void> {
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
						connect: {
							channelName,
						},
					},
					user: {
						connect: {
							id
						},
					}
				},
			});
		} catch (error: any) {
			throw new InternalServerErrorException('Prisma failed to create message');
		}
	}
}
