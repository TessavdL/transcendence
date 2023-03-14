import { Injectable, Logger } from '@nestjs/common';
import { Client, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserClientService {
  constructor(private readonly prisma: PrismaService) { }
  private readonly logger: Logger = new Logger('UserService');

  async createClient(clientId: string, userIntraId: number): Promise<void> {
    try {
      await this.prisma.client.create({
        data: {
          id: clientId,
          intraId: userIntraId,
        },
      });
    } catch (error) {
      this.logger.error('Error creating client');
    }
  }

  async updateClientId(clientId: string, userIntraId: number): Promise<void> {
    try {
      await this.prisma.client.update({
        where: {
          intraId: userIntraId,
        },
        data: {
          id: clientId,
        },
      });
    } catch (error) {
      this.logger.error('Error updating client');
    }
  }

  async updateOrCreateclient(
    clientId: string,
    userIntraId: number,
  ): Promise<void> {
    console.log(`clientId = ${clientId}, userintraId = ${userIntraId}`);
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
    } catch (error) {
      this.logger.error('Error creating and updating client');
    }
  }

  async getClientIntraId(clientId: string): Promise<number> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          id: clientId,
        },
      });
      return client.intraId;
    } catch (error) {
      this.logger.error('Error finding the client based on clientId');
    }
  }

  async getClientId(intraId: number): Promise<string> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          intraId: intraId,
        },
      });
      return client.id;
    } catch (error) {
      this.logger.error('Error finding the client based on intraId');
    }
  }

  async getClient(intraId: number): Promise<Client> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          intraId: intraId,
        },
      });
      return client;
    } catch (error) {
      this.logger.error('Error find client');
    }
  }

  async deleteClientBasedOnId(clientId: string): Promise<void> {
    try {
      await this.prisma.client.delete({
        where: {
          id: clientId,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting client');
    }
  }

  async deleteClientBasedOnIntraId(intraId: number): Promise<void> {
    try {
      await this.prisma.client.delete({
        where: {
          intraId: intraId,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting client');
    }
  }

  async getUser(clientId: string): Promise<User> {
    try {
      const intraId: number = await this.getClientIntraId(clientId);
      const user: User = await this.prisma.user.findUnique({
        where: {
          intraId: intraId,
        },
      });
      return (user);
    } catch (error) {
      this.logger.error('Error returning user');
    }
  }
}
