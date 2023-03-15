import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Channel, DMChannel, User, UserMessage } from '@prisma/client';
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

  async findAllChannels(): Promise<Channel[]> {
    try {
      const channels: Channel[] = await this.prisma.channel.findMany({});
      return channels;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllMessagesInChannel(channelName: string): Promise<UserMessage[]> {
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
}
