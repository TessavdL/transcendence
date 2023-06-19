import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { Game, Players } from './types';
import { Logger } from '@nestjs/common';
import { ActivityStatus, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
	cors: {
		origin: `http://${process.env.HOST}:5173`,
		credentials: true,
	},
	namespace: "pong-game",
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private readonly gameService: GameService,
		private readonly jwtStrategy: JwtStrategy,
		private readonly userService: UserService,
	) { }
	private readonly logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	server: Server;

	afterInit(): void {
		this.logger.log('GameGateway Initialized');
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connect id = ${client.id}`);
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
		await this.userService.setActivityStatus(user.intraId, ActivityStatus.INGAME);
		const game: Game = this.gameService.gameData();
		client.emit('gameData', game);
		client.emit('connected');
	}

	async handleDisconnect(client: Socket) {
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
		await this.userService.setActivityStatus(user.intraId, ActivityStatus.ONLINE);
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

	// @SubscribeMessage('ballMovement')
	// handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() object: {
	// 	gameStatus: Game,
	// 	roomName: string,
	// }) {
	// 	const newBallPosition = this.gameService.ballMovement(object.gameStatus);
	// 	// client.emit('updategameStatus', newBallPosition);
	// 	// client.to(object.roomName).emit('updategameStatus', newBallPosition);
	// 	this.server.to(object.roomName).emit('updategameStatus', newBallPosition);
	// }

@SubscribeMessage('ballMovement')
handleBallMovement(@ConnectedSocket() client: Socket, @MessageBody() object: {
	gameStatus: Game,
	roomName: string,
	}) {
		const newPositionPlayerOne = object.gameStatus.player1Position; //current position
		const newPositionPlayerTwo = object.gameStatus.player2Position;
		const updatedGameStatus = { ...object.gameStatus }; // Create a copy of the game status
		if (object.gameStatus.turnPlayerOne) {
			updatedGameStatus.player1Position = newPositionPlayerOne;
		} 
		else if (object.gameStatus.turnPlayerTwo) {
			updatedGameStatus.player2Position = newPositionPlayerTwo;
		}
		const newBallPosition = this.gameService.ballMovement(updatedGameStatus, object.roomName);
		// this.server.to(object.roomName).emit('updategameStatus', newBallPosition);
		client.emit('updategameStatus', newBallPosition);
		client.to(object.roomName).emit('updategameStatus', newBallPosition);
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
		console.log('game started');
	}

	@SubscribeMessage('endGame')
	endGame(@ConnectedSocket() client: Socket, @MessageBody() object: {
		gameStatus: Game,
		roomName: string,
		player: string,
		}) {
		if (!object.gameStatus || !object.roomName || !object.player) {
			return ;
		}
		client.to(object.roomName).emit('gameEnded');
		if (object.player === 'playerone') {
			object.gameStatus.player2Score = 3;
			object.gameStatus.player1Score = 0;
		} else {
			object.gameStatus.player1Score = 3;
			object.gameStatus.player2Score = 0;
		}
		this.gameService.endGame(object.gameStatus, object.roomName);
		client.emit('disconnectPlayer');
	}
}
