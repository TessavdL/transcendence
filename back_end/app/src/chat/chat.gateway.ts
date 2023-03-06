import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserClientService } from 'src/user/client/client.service';
import { JwtStrategy } from 'src/auth/strategy';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';

//   @UseGuards(JwtAuthGuard)
@WebSocketGateway({
  cors: {
    origin: 'localhost:5173',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly userClientService: UserClientService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}
  private readonly logger: Logger = new Logger('WebsocketGateway');

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('ChatGateway Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      const token: string = this.authService.getJwtTokenFromSocket(client);
      const payload: { name: string; sub: number } =
        await this.authService.verifyToken(token);
      const user: User = await this.jwtStrategy.validate(payload);
	  console.log(user);
      this.userClientService.updateOrCreateclient(client.id, user.intraId);
    } catch (error) {
      this.logger.error(error);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('event')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
	return data;
  }

  @SubscribeMessage('joinRoom')
  handeJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: number): string {
	console.log(`joined room number ${data}`);
	return ('data');
  }

  @SubscribeMessage('sendMessageToRoom')
  handleRoomMessage(@ConnectedSocket() client: Socket, @MessageBody() data: number): string {
	console.log(`send message to room number ${data}`);
	return ('data');
  }
}
