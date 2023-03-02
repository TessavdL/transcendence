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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { SocketClientService } from 'src/user/socketclient/socketclient.service';

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
    private readonly jwtStrategy: JwtStrategy,
    private readonly socketClientService: SocketClientService,
    private readonly authService: AuthService,
  ) {}
  private readonly logger: Logger = new Logger('WebsocketGateway');

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('ChatGateway Initialized');
  }

  async handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<string> | null {
    try {
      const token: string = this.authService.getToken(client);

      const payload: { name: string, sub: number} = await this.authService.verifyToken(token);
    
      const user: User = await this.jwtStrategy.validate(payload);

      this.socketClientService.updateOrCreateclient(client.id, user.intraId);

      this.logger.log(`Client connected. Username: ${user.name}. Id: ${client.id}`);
      return (data);
    }
    catch (error) {
      this.logger.error(error);
      client.disconnect();
      return (null);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('events')
	handleEvent(@MessageBody() data: string): string {
      return data;
    }
}
