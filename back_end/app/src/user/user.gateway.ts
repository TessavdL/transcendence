import {
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { ActivityStatus, User } from '@prisma/client';
import { UserService } from './user.service';
import { ClientGuard } from 'src/auth/guards/client-auth.guard';
import { UserSharedService } from './user.shared.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly userSharedService: UserSharedService,
  ) { }
  private readonly logger: Logger = new Logger('UserGateway');

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log('UserGateway Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client is trying to connect: ${client.id}`);
    let user: User;

    try {
      const token: string = this.authService.getJwtTokenFromSocket(client);
      const payload: { name: string; sub: number } = await this.authService.verifyToken(token);
      user = await this.jwtStrategy.validate(payload);
    } catch (error: any) {
      this.server.to(client.id).emit('unauthorized', { message: 'Authorization is required before a connection can be made' });
      this.logger.error(`Client connection refused: ${client.id}`);
      client.disconnect();
    }
    try {
      if (this.isActive(user.intraId) === false) {
        await this.userService.setActivityStatus(user.intraId, ActivityStatus.ONLINE);
      }
      this.userSharedService.clientToIntraId.set(client.id, user.intraId);
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error: any) {
      this.server.to(client.id).emit('error', error?.message || 'An error occured in user.gateway handleConnection');
    }
  }

  @UseGuards(ClientGuard)
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const intraId: number = this.userSharedService.clientToIntraId.get(client.id);
      this.userSharedService.clientToIntraId.delete(client.id);
      if (this.isActive(intraId) === false) {
        await this.userService.setActivityStatus(intraId, ActivityStatus.OFFLINE);
      }
      client.disconnect();
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error: any) {
      this.server.to(client.id).emit('error', error?.message || 'An error occured in chat.gateway handleDisconnect');
    }
  }

  private isActive(intraId: number): boolean {
    for (const [clientId, clientIntraId] of this.userSharedService.clientToIntraId.entries()) {
      if (clientIntraId === intraId) {
        return true;
      }
    }
    return false;
  }
}
