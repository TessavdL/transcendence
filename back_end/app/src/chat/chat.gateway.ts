import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  } from '@nestjs/websockets';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtStrategy } from 'src/auth/strategy';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
  
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
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      const token: string = this.getToken(client);

      const payload: { name: string, sub: number} = await this.verifyToken(token);
    
      const user: User = await this.jwtStrategy.validate(payload);

      this.logger.log(`Client connected. Username: ${user.name}. Id: ${client.id}`);
      return (data);
    }
    catch (error) {
      client.disconnect();
      return (null)
    }
  }

  getToken(client: Socket): string {
    try {
      const token = client.handshake.headers.cookie.split(';').find((cookie: string) => cookie.startsWith('jwt=')).split('=')[1];
      return (token);
    }
    catch (error) {
      this.logger.error('Could not find jwt token in cookie');
      throw new Error(error);
    }
  }

  async verifyToken(token: string): Promise<{ name: string, sub: number }> {
    try {
      const secret: string = this.configService.get('JWT_SECRET');

      const payload: any = await this.jwtService.verify(token, {secret: secret, clockTolerance: 100});

      const name: string = payload.name;
      const sub: number = payload.sub;
      return { name, sub };
    }
    catch (error) {
      this.logger.error('Token is invalid')
      throw new Error(error);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
  this.logger.log(`Client disconnected: ${client.id}`);
  }
}