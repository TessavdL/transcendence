import { ConnectedSocket, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
	namespace: "game",
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection {
	constructor(private readonly gameService: GameService) { }

	private readonly logger: Logger = new Logger('GameGateway');

	afterInit(): void {
		this.logger.log('GameGateway Initialized');
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client id = ${client.id}`);
		this.logger.log("hi from backend");
	}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('movePaddle')
	handlePaddleUp(@ConnectedSocket() client: Socket) {
		this.logger.log('Reached backend');
	}
}
