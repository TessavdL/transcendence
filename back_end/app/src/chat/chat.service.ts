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
		private readonly chatSharedService: ChatSharedService,
	) { }

	private readonly logger: Logger = new Logger('UserService initialized');

	async getNonBlockedClientIds(senderid: string, senderclientId: string, allClientIds: string[]): Promise<string[]> {
		const nonBlockedClientIds: string[] = [senderclientId];

		const relationships: { userId: string; }[] = await this.prisma.allOtherUsers.findMany({
			where: {
				otherUserId: senderid,
				blockedStatus: false,
			},
			select: {
				userId: true,
			},
		});

		for (const clientId of allClientIds) {
			const id = this.chatSharedService.clientIdToUserId.get(clientId);
			if (id && id !== senderid && relationships.some((relationship) => { return relationship.id === id })) {
				nonBlockedClientIds.push(clientId);
			}
		}

		return nonBlockedClientIds;
	}
}
