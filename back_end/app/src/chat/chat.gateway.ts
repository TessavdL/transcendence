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
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: 'localhost:5173',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly authService: AuthService) {}
  private readonly logger: Logger = new Logger('WebsocketGateway');

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('ChatGateway Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      this.authService.verifyWebsocketToken(client);
    } catch (error) {
      this.logger.error(error);
      client.disconnect();
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
