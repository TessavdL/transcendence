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
import { UserClientService } from 'src/user/client/client.service';
import { JwtStrategy } from 'src/auth/strategy';
import { User } from '@prisma/client';
import { ChatService } from './chat.service';
import { Messages } from './types';

@WebSocketGateway({
  cors: {
    origin: 'localhost:5173',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly userClientService: UserClientService,
    private readonly jwtStrategy: JwtStrategy,
  ) { }
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
      this.userClientService.updateOrCreateclient(client.id, user.intraId);
    } catch (error) {
      this.logger.error(error);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() data: string): string {
    client.join(data);
    console.log(`${client.id} joined channel ${data}`);
    return ('data');
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() data: string): string {
    client.leave(data);
    console.log(`${client.id} left channel ${data}`);
    return ('data');
  }

  @SubscribeMessage('sendMessageToChannel')
  async handleChannelMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { messageText: string, channelName: string }) {
    console.log(data.channelName);
    const channelName = data.channelName;
    const text = data.messageText;
    const message: Messages = await this.chatService.handleChannelMessage(client, channelName, text);
    this.server.to(channelName).emit('message', message);
  }
}
