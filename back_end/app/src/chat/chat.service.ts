import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Channel, DMChannel, User, UserMessage } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ChatService {
	constructor(private readonly prisma: PrismaService) { }

	private readonly logger: Logger = new Logger('UserService initialized');

	async createChannel(channelName: string, createdByIntraId: number): Promise<string> {
		const existingChannel: Channel = await this.findChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: `Channel ${channelName} already exists` }, HttpStatus.BAD_REQUEST);
		try {
			const newChannel = await this.prisma.channel.create({
				data: {
					createdByIntraId: createdByIntraId,
					channelName: channelName,
				},
			});
			return (newChannel.channelName);
		} catch (error) {
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
		console.log(channelName);
		const existingChannel: DMChannel = await this.findDMChannel(channelName);
		if (existingChannel)
			throw new HttpException({ reason: `Channel ${channelName} already exists` }, HttpStatus.BAD_REQUEST);
		try {
			const newDMChannel = await this.prisma.dMChannel.create({
				data: {
					otherIntraId: otherIntraId,
					channelName: channelName,
					user: {
						connect: {
							intraId: user.intraId,
						},
					},
				},
			});
			return newDMChannel.channelName;
		} catch (error) {
			throw new InternalServerErrorException(error.message);
		}
	}

	async findChannel(channelName: string): Promise<Channel> | null {
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

	async findDMChannel(channelName: string): Promise<DMChannel> | null {
		try {
			const channel: DMChannel = await this.prisma.dMChannel.findUnique({
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
}
