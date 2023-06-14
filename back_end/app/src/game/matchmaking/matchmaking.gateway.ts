import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
import { GameSharedService } from '../game.shared.service';

@WebSocketGateway({
	cors: {
		origin: `http://${process.env.HOST}:5173`,
		credentials: true,
	},
	namespace: 'matchmaking'
})
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly jwtStrategy: JwtStrategy,
		private sharedService: GameSharedService,
		// private readonly matchmakingService: MatchmakingService,
	) {
		this.otherclient = '';
	}

	private readonly logger: Logger = new Logger('MatchmakingGateway');
	private otherclient: string;

	@WebSocketServer()
	server: Server

	afterInit(): void {
		this.logger.log('MatchmakingGateway Initialized')
	}

	async handleConnection(client: Socket): Promise<void> {
		let user: User;
		this.logger.log(`Client with ${client.id} is trying to connect`)
		// verify client
		try {
			const token: string = this.authService.getJwtTokenFromSocket(client);
			const payload: { name: string; sub: number } = await this.authService.verifyToken(token);
			user = await this.jwtStrategy.validate(payload);
			if (user.activityStatus === 'INGAME') {
				client.emit('error', 'Cannot play more than one game at the same time');
				client.disconnect();
				return;
			}
		} catch (error: any) {
			this.server.to(client.id).emit('unauthorized', { message: 'Authorization is required before a connection can be made' });
			this.logger.error(`Client connection refused: ${client.id}`);
			client.disconnect();
		}

		// keep track of client
		this.sharedService.clientToIntraId.set(client.id, user.intraId);
		client.emit('connected');
	}

	@SubscribeMessage('matchmaking')
	handleMatchmaking(client: Socket): void {
		// check if matchmaking is possible, if not save the client.id
		if (this.otherclient.length === 0) {
			console.log('waiting for other player')
			this.otherclient = client.id;
		}

		// create the game
		// in frontend redirect to game/roomName
		else {
			const roomName: string = this.generateString(8);
			const player1: { intraId: number } = {
				intraId: this.sharedService.clientToIntraId.get(this.otherclient),
			};
			const player2: { intraId: number } = {
				intraId: this.sharedService.clientToIntraId.get(client.id),
			};
			if (player1.intraId === player2.intraId) {
				this.server.to(client.id).to(this.otherclient).emit('error', 'cannot play against yourself, redirecting home');
				this.otherclient = '';
				return;
			}
			console.log(`creating room: ${roomName}`);
			this.sharedService.playerData.set(roomName, { player1, player2 });
			const players = this.sharedService.playerData.get(roomName);
			console.log({ players });
			console.log(`player id after setting ${player1.intraId} ${player2.intraId}`);
			this.server.to(client.id).to(this.otherclient).emit('createGame', roomName);
			this.otherclient = '';
		}
		this.logger.log(`Client connected ${client.id}`);
	}

	private generateString(length: number): string {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
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
		this.logger.log(`Client disconnected ${client.id}`);
	}
}
