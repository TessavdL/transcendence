import { ConnectedSocket, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';


@WebSocketGateway({
	origin: 'http://localhost:5173',
	credentials: true,
	namespace: "pong-game",
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection {
  constructor(private readonly gameService: GameService) {}

  afterInit(): void {
	console.log('ChatGateway Initialized');
}

	handleConnection(client: Socket, ...args: any[]) {
		console.log("hi from backend");
	}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('movePaddle')
  handlePaddleUp(@ConnectedSocket() client: Socket) {
	  console.log('Reached backend');
  }

}
