import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MatchmakingService } from './matchmaking.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
import { SharedService } from '../game.shared.service';

@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly jwtStrategy: JwtStrategy,
		private sharedService: SharedService,
		// private readonly matchmakingService: MatchmakingService,
	) {
		this.otherclient = '';
	}

	private readonly logger: Logger = new Logger('MatchmakingGateway')
	private otherclient: string;

	@WebSocketServer()
	server: Server

	afterInit(): void {
		this.logger.log('MatchmakingGatway Initialized')
	}

	async handleConnection(client: Socket, args: any): Promise<void> {
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

		// check if matchmaking is possible, if not save the client.id
		if (this.otherclient.length === 0) {
			this.otherclient = client.id;
		}

		// check if player is not trying to play a game against themselves
		// in frontend redirect home
		else if (this.otherclient.length > 0 && this.sharedService.clientToIntraId.get(this.otherclient) === user.intraId) {
			client.emit('error', 'It is not possible to play a match against yourself');
		}

		// create the game
		// in frontend redirect to game/roomName
		else {
			const roomName: string = this.generateString(8);
			const player1: { intraId: number } = {
				intraId: this.sharedService.clientToIntraId.get(this.otherclient),
			};
			const player2: { intraId: number } = {
				intraId: user.intraId,
			};
			this.sharedService.gameData.set(roomName, { player1, player2 });
			this.server.to(client.id).to(this.otherclient).emit('createGame', roomName);
			this.otherclient = '';
		}
		console.log(`Client connected ${client.id}`);
	}

	private generateString(length: number): string {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = ' ';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}

	handleDisconnect(client: Socket): void {
		// remove client from client to intraId map
		this.sharedService.clientToIntraId.delete(client.id);
		if (this.otherclient === client.id) {
			this.otherclient = '';
		}
		console.log(`Client disconnected ${client.id}`);
	}
}
