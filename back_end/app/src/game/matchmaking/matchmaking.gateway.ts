import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MatchmakingService } from './matchmaking.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';

@WebSocketGateway()
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly jwtStrategy: JwtStrategy,
		// private readonly matchmakingService: MatchmakingService,
	) {
		this.otherclient = '';
		this.clientIdToIntraId = new Map<string, { intraId: number, name: string }>();
	}

	private readonly logger: Logger = new Logger('MatchmakingGateway')
	private otherclient: string;
	private clientIdToIntraId: Map<string, { intraId: number, name: string }>;

	@WebSocketServer()
	server: Server

	afterInit(): void {
		this.logger.log('MatchmakingGatway Initialized')
	}

	async handleConnection(client: Socket): Promise<void> {
		let user: User;

		try {
			// verify client
			const token: string = this.authService.getJwtTokenFromSocket(client);
			const payload: { name: string; sub: number } = await this.authService.verifyToken(token);
			user = await this.jwtStrategy.validate(payload);
		} catch (error: any) {
			this.server.to(client.id).emit('unauthorized', { message: 'Authorization is required before a connection can be made' });
			this.logger.error(`Client connection refused: ${client.id}`);
			client.disconnect();
		}

		this.clientIdToIntraId.set(client.id, { intraId: user.intraId, name: user.name });

		if (this.otherclient.length === 0) {
			this.otherclient = client.id;
		}
		else {
			const data: { player1: { intraId: number, name: string }, player2: { intraId: number, name: string } } = {
				player1: this.clientIdToIntraId.get(this.otherclient),
				player2: { intraId: user.intraId, name: user.name },
			};
			this.server.to(client.id).to(this.otherclient).emit('createGame', data);
		}
		console.log(`Client connected ${client.id}`);
	}

	handleDisconnect(client: Socket): void {
		this.clientIdToIntraId.delete(client.id);
		if (this.otherclient === client.id) {
			this.otherclient = '';
		}
		console.log(`Client disconnected ${client.id}`);
	}


}
