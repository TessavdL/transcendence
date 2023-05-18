import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Game } from './type';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	origin: 'http://localhost:5173',
	credentials: true,
	namespace: "pong-game",
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly gameService: GameService) { }

	private readonly logger: Logger = new Logger('GameGateway');

	afterInit(): void {
		this.logger.log('GameGateway Initialized');
	}

	handleConnection(client: Socket) {
		console.log(`Client connect id = ${client.id}`);
		const game: Game = this.gameService.gameData();
		client.emit('gameData', game);
	}
	handleDisconnect(client: Socket) {
		console.log(`Client disconnect id = ${client.id}`);
	}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('movePaddle')
	handlePaddleUp(@ConnectedSocket() client: Socket, @MessageBody() movement: string) {
		console.log(movement);
		//this.gameService.movement(movement);
		const position: number = this.gameService.movement(movement);
		client.emit('updatePaddlePosition', position);
	}
	@SubscribeMessage('ballMovement')
	handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() gameStatus: Game) {
		const newBallPosition = this.gameService.ballMovement(gameStatus);
		client.emit('gameData', gameStatus);
	}

}
