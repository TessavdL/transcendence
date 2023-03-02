import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocketClientService {  constructor(
    private readonly prisma: PrismaService,
    ) {}
  private readonly logger: Logger = new Logger('UserService');
    
  async createClient(clientId: string, userIntraId: number): Promise<void> {
    try {
      await this.prisma.client.create({
        data: {
          id: clientId,
          intraId: userIntraId,
        },
      });
    }
    catch (error) {
      this.logger.error('Error creating client');
    }
  }

  async updateClient(clientId: string, userIntraId: number): Promise<void> {
    try {
      await this.prisma.client.update({
        where: {
          intraId: userIntraId,
        },
        data: {
          id: clientId,
        },
      });
    }
    catch (error) {
      this.logger.error('Error updating client');
    }
  }

  async updateOrCreateclient(clientId: string, userIntraId: number): Promise<void> {
    try {
      await this.prisma.client.upsert({
        where: {
          intraId: userIntraId,
        },
        update: {
          id: clientId,
        },
        create: {
          intraId: userIntraId,
          id: clientId,
        },
      });
    }
    catch (error) {
      this.logger.error('Error creating and updating client');
     }
  }
}
