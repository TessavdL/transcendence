import {
	ConnectedSocket,
	MessageBody,
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	type OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserClientService } from 'src/user/client/client.service';
import { JwtStrategy } from 'src/auth/strategy';
import { ActivityStatus, Membership, User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import { Message } from './types';

@WebSocketGateway({
	cors: {
		origin: 'localhost:5173',
		credentials: true,
	},
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly chatService: ChatService,
		private readonly userService: UserService,
		private readonly jwtStrategy: JwtStrategy,
	) {
		this.clientToIntraId = new Map<string, number>();
		this.channelToClientIds = new Map<string, string[]>();
	}
	private readonly logger: Logger = new Logger('WebsocketGateway');
	private clientToIntraId: Map<string, number>;
	private channelToClientIds: Map<string, string[]>;

	@WebSocketServer()
	server: Server;

	afterInit(): void {
		this.logger.log('ChatGateway Initialized');
	}

	async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
		this.logger.log(`Client is trying to connect: ${client.id}`);

		try {
			const token: string = this.authService.getJwtTokenFromSocket(client);
			const payload: { name: string; sub: number } = await this.authService.verifyToken(token);
			const user: User = await this.jwtStrategy.validate(payload);

			// add client to map
			this.clientToIntraId.set(client.id, user.intraId);

			// set status to online
			const status: ActivityStatus = await this.userService.setActivityStatus(user.intraId, ActivityStatus.ONLINE);
			this.logger.log(`Client connected: ${client.id}, status: ${status}`);
		} catch (error) {
			this.logger.error(error);
			this.logger.error(`Client connection refused: ${client.id}`);
			client.disconnect();
		}
	}

	async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
		try {
			const intraId: number = this.clientToIntraId.get(client.id);

			// remove client from map
			this.clientToIntraId.delete(client.id);

			// set status to offline			
			const status: ActivityStatus = await this.userService.setActivityStatus(intraId, ActivityStatus.OFFLINE);
			this.logger.log(`Client disconnected: ${client.id}, status: ${status}`);
		} catch (error: any) {
			this.logger.error(error);
		}
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() channelName: string) {
		const intraId: number = this.clientToIntraId.get(client.id);
		const member: (Membership & { user: User; }) = await this.chatService.getMemberWithUser(channelName, intraId);

		const otherClientsInChannel: string[] = this.channelToClientIds.get(channelName) || [];

		const otherJoinedMembersInChannel = this.getJoinedMembersInChannel(channelName, otherClientsInChannel);

		// add client to channel map
		this.channelToClientIds.set(channelName, [...otherClientsInChannel, client.id]);

		// join channel
		client.join(channelName);

		// inform all other users in the channel that a user joined
		this.server.to(channelName).emit('userJoined', member);

		// inform current user which other members are in the channel
		client.emit('otherJoinedMembers', otherJoinedMembersInChannel);
	}

	private async getJoinedMembersInChannel(channelName: string, otherClientsInChannel: string[]) {
		const otherUserIntraIds: number[] = otherClientsInChannel.map(clientId => this.clientToIntraId.get(clientId));

		const otherMembersInChannel: (Membership & { user: User })[] = await this.chatService.getMembersWithUser(channelName);

		const otherJoinedMembersInChannel: (Membership & { user: User })[] = otherMembersInChannel.filter(member => {
			if (otherUserIntraIds.find(intraId => { intraId === member.user.intraId })) {
				return member;
			}
		});

		return otherJoinedMembersInChannel;
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() channelName: string) {
		const intraId: number = this.clientToIntraId.get(client.id);
		const member: (Membership & { user: User; }) = await this.chatService.getMemberWithUser(channelName, intraId);

		const clientsInChannel: string[] = this.channelToClientIds.get(channelName);
		const updatedClientsInChannel: string[] = clientsInChannel.filter(clientId => clientId !== client.id);
		this.channelToClientIds.set(channelName, updatedClientsInChannel);

		// leave channel
		client.leave(channelName);

		// inform all other users in the channel that a user left
		this.server.to(channelName).emit('userLeft', member);
	}

	@SubscribeMessage('sendMessageToChannel')
	async handleChannelMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { messageText: string, channelName: string }) {
		const text = data.messageText;
		const channelName = data.channelName;
		const intraId = this.clientToIntraId.get(client.id)
		const message: Message = await this.chatService.handleChannelMessage(intraId, channelName, text);
		this.server.to(channelName).emit('message', message);
	}

	@SubscribeMessage('kickUser')
	async kickUser(@ConnectedSocket() client: Socket, @MessageBody() data: { otherIntraId: number, channelName: string }): Promise<void> {
		try {
			const intraId: number = this.clientToIntraId.get(client.id);
			const clientIdsInChannel: string[] = this.channelToClientIds.get(data.channelName);
			const canBeKicked: boolean = await this.chatService.canBePunished(intraId, data.otherIntraId, data.channelName);
			const clientIds: string[] = this.getClientIds(clientIdsInChannel, data.otherIntraId);
			if (canBeKicked === true) {
				this.server.to(clientIds).emit('leaveChannel', { channelName: data.channelName });
			}
			else {
				this.server.to(client.id).emit('error', { message: 'Cannot kick user' });
			}
		} catch (error) {
			this.server.to(client.id).emit('error', error?.message || 'An error occured in chat.gateway kickUser');
		}
	}

	// currently users are banned, whether they are in the channel or not
	// if they are in the channel they are also kicked
	@SubscribeMessage('banUser')
	async banUser(@ConnectedSocket() client: Socket, @MessageBody() data: { otherIntraId: number, channelName: string }): Promise<void> {
		try {
			const intraId: number = this.clientToIntraId.get(client.id);
			const clientIdsInChannel: string[] = this.channelToClientIds.get(data.channelName);
			const canBeBanned: boolean = await this.chatService.canBePunished(intraId, data.otherIntraId, data.channelName);
			const clientIds: string[] = this.getClientIds(clientIdsInChannel, data.otherIntraId);
			if (canBeBanned === true) {
				this.server.to(clientIds).emit('leaveChannel', { channelName: data.channelName });
				await this.chatService.banUser(data.otherIntraId, data.channelName);
			}
		} catch (error) {
			this.server.to(client.id).emit('error', error?.message || 'An error occured in chat.gateway banUser');
		}
	}

	// currently users are muted, whether they are in the channel or not
	// technically we can remove the error emit and put this function in the controller
	@SubscribeMessage('muteUser')
	async muteUser(@ConnectedSocket() client: Socket, @MessageBody() data: { otherIntraId: number, channelName: string }): Promise<void> {
		try {
			const intraId: number = this.clientToIntraId.get(client.id);
			const canBeMuted: boolean = await this.chatService.canBePunished(intraId, data.otherIntraId, data.channelName);
			if (canBeMuted === true) {
				await this.chatService.muteUser(data.otherIntraId, data.channelName);
			}
		} catch (error) {
			this.server.to(client.id).emit('error', error?.message || 'An error occured in chat.gateway muteUser');
		}
	}

	private getClientIds(clientIdsInChannel: string[], otherIntraId: number): string[] {
		let clientIds: string[] = [];
		for (const clientId of clientIdsInChannel) {
			if (otherIntraId === this.clientToIntraId.get(clientId)) {
				clientIds.push(clientId);
			}
		}
		return clientIds;
	}
}
