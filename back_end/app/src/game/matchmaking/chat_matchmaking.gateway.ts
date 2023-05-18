import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
import { SharedService } from '../game.shared.service';

@WebSocketGateway({
    cors: {
        origin: 'https://localhost:5173',
        credentials: true,
    },
    namespace: 'chat_matchmaking'
})
export class ChatMatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly jwtStrategy: JwtStrategy,
		private sharedService: SharedService,
	) {
		this.otherclient = '';
	}

	private readonly logger: Logger = new Logger('chatMatchmakingGateway')
	private otherclient: string;

	@WebSocketServer()
	server: Server

	afterInit(): void {
		this.logger.log('chatMatchmakingGateway Initialized')
	}

	async handleConnection(client: Socket): Promise<void> {
		let user: User;

		// verify client
		try {
			const token: string = this.authService.getJwtTokenFromSocket(client);
			const payload: { name: string; sub: number } = await this.authService.verifyToken(token);
			user = await this.jwtStrategy.validate(payload);
		} catch (error: any) {
			this.server.to(client.id).emit('unauthorized', { message: 'Authorization is required before a connection can be made' });
			this.logger.error(`Client connection refused: ${client.id}`);
			client.disconnect();
		}

        // keep track of client
        this.sharedService.clientToIntraId.set(client.id, user.intraId);
        client.emit('connected');
    }

    @SubscribeMessage('chat_matchmaking')
    handleChatMatchmaking(client: Socket, args: string): void {
		const members: string[] = args.split('+');
		if (members[0] !== this.sharedService.clientToIntraId.get(client.id).toString() && members[1] !== this.sharedService.clientToIntraId.get(client.id).toString())
			client.emit('error', 'User does not belong in this match');

		// keep track of client
		this.sharedService.clientToIntraId.set(client.id, this.sharedService.clientToIntraId.get(client.id));

		// check if matchmaking is possible, if not save the client.id
		if (this.otherclient.length === 0) {
			this.otherclient = client.id;
		}

		else if (this.otherclient === 'disconnected') {
			client.emit('error', "Game no longer valid, please remake the game");
		}

		// check if player is not trying to play a game against themselves
		// in frontend redirect home
		else if (this.otherclient.length > 0 && this.sharedService.clientToIntraId.get(this.otherclient) === this.sharedService.clientToIntraId.get(client.id)) {
			client.emit('error', 'It is not possible to play a match against yourself');
		}

		// create the game
		// in frontend redirect to game/roomName
		else {
			const player1: { intraId: number } = {
				intraId: this.sharedService.clientToIntraId.get(this.otherclient),
			};
			const player2: { intraId: number } = {
				intraId: this.sharedService.clientToIntraId.get(client.id),
			};
			this.sharedService.gameData.set(args, { player1, player2 });
			this.server.to(client.id).to(this.otherclient).emit('createGame', args);
			this.otherclient = '';
		}
		console.log(`Client connected ${client.id}`);
	}

	handleDisconnect(client: Socket): void {
		// remove client from client to intraId map
		this.sharedService.clientToIntraId.delete(client.id);
		if (this.otherclient === client.id) {
			this.otherclient = 'disconnected';
		}
		console.log(`Client disconnected ${client.id}`);
	}
}

// Needs to be somewhere in frontend
// const getRoomName: any = (intraId: number, otherIntraId: number): string => {
// 	let members: string[] = [user.intraId.toString(), this.otherclient];
// 	members = members.sort();
// 	return (`${members.at(0)}+${members.at(1)}`);
// }
// const roomName = getRoomName(user.intraId, this.sharedService.clientToIntraId.get(this.otherclient));