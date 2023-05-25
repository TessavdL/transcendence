import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Game, Players } from './types';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
	namespace: "pong-game",
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly gameService: GameService,
	) { }
	private readonly logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	server: Server;

	afterInit(): void {
		this.logger.log('GameGateway Initialized');
	}

	handleConnection(client: Socket) {
		this.logger.log(`Client connect id = ${client.id}`);
		const game: Game = this.gameService.gameData();
		client.emit('gameData', game);
		client.emit('connected');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnect id = ${client.id}`);
	}

	@SubscribeMessage('movePaddle')
	handlePaddleUp(@ConnectedSocket() client: Socket, @MessageBody() object: {
		movement: string,
		player: string,
		roomName: string,
		game: Game,
	}) {
		const position: number = this.gameService.movement(object.movement);
		if (this.gameService.canMove(position, object.player, object.game)) {
			client.emit('updatePaddlePosition', position);
			client.to(object.roomName).emit('otherPlayerUpdatePaddlePosition', position);
		}
	}

	@SubscribeMessage('ballMovement')
	handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() object: {
		gameStatus: Game,
		roomName: string,
	}) {
		const newBallPosition = this.gameService.ballMovement(object.gameStatus);
		client.emit('updategameStatus', newBallPosition);
		client.to(object.roomName).emit('updategameStatus', newBallPosition);
		//this.server.to(object.roomName).emit('updategameStatus', newBallPosition);
	}

	@SubscribeMessage('assignPlayers')
	assignPlayers(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		const players: Players = this.gameService.assignPlayers(roomname);
		client.join(roomname);
		client.emit('playerisSet', players);
	}

	@SubscribeMessage('startGame')
	handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		client.emit('gameStarted');
		client.to(roomname).emit('gameStarted');
	}
}
