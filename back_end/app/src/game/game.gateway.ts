import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Game } from './type';
import { ConsoleLogger, Logger } from '@nestjs/common';
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
	handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() 
	object: { gameStatus: Game, roomName: string }) {
		const newBallPosition = this.gameService.ballMovement(object.gameStatus);
		client.emit('updategameStatus', newBallPosition);
		client.to(object.roomName).emit('updategameStatus', newBallPosition);
	}
	@SubscribeMessage('assignPlayers')
	assignPlayers(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		const players: GameData = this.gameService.assignPlayers(roomname);
		console.log({players})
		client.join(roomname);
		client.emit('playerisSet', players);
	}
	@SubscribeMessage('startGame')
	handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() roomname: string) {
		client.emit('gameStarted');
		client.to(roomname).emit('gameStarted');
	}
}
