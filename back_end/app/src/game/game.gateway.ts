import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Game } from './type';
import { Logger } from '@nestjs/common';
import { GameData } from './types';


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

	afterInit(): void {
		this.logger.log('GameGateway Initialized');
	}

	handleConnection(client: Socket) {
		console.log(`Client connect id = ${client.id}`);
		const game: Game = this.gameService.gameData();
		client.emit('gameData', game);
		client.emit('connected');
	}
	handleDisconnect(client: Socket) {
		console.log(`Client disconnect id = ${client.id}`);
	}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('movePaddle')
	handlePaddleUp(@ConnectedSocket() client: Socket, @MessageBody() object: { movement: string, roomName: string}) {
		console.log(object);
		//this.gameService.movement(movement);
		const position: number = this.gameService.movement(object.movement);
		client.emit('updatePaddlePosition', position);
		client.to(object.roomName).emit('otherPlayerUpdatePaddlePosition', position);
	}
	@SubscribeMessage('ballMovement')
	handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() gameStatus: Game) {
		const newBallPosition = this.gameService.ballMovement(gameStatus);
		client.emit('gameData', gameStatus);
	}
	@SubscribeMessage('assignPlayers')
	assignPlayers(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		// const players: GameData = this.gameService.assignPlayers(roomname);
		client.join(roomname);
		const players: GameData = {
			player1: {
				intraId: 74757,
			},
			player2: {
				intraId: 64297,
			},
		};
		client.emit('playerisSet', players);
	}
	@SubscribeMessage('startGame')
	handleGameStart(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		client.emit('startGame');
		client.to(roomname).emit('startGame');
	}

}
