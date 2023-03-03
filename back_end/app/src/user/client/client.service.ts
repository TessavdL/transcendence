import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserClientService {
  constructor(private readonly prisma: PrismaService) {}
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

  async getClientIntraId(
    clientId: string,
  ): Promise<number> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          client.id: clientId,
        },
      });
      return (client.intraId);
    } catch (error) {
      this.logger.error('Error creating and updating client');
    }
  }

  async getClientId(
    intraId: number,
  ): Promise<string> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          client.intraId: intraId,
        },
      });
      return (client.id);
    } catch (error) {
      this.logger.error('Error creating and updating client');
    }
  }

  async getClient(
    intraId: number,
  ): Promise<Client> {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          client.intraId: intraId,
        },
      });
      return (client);
    } catch (error) {
      this.logger.error('Error creating and updating client');
    }
  }

  async deleteClientBasedOnId(
    clientId: string,
  ): Promise<void> {
    try {
      await this.prisma.client.delete({
        where: {
          client.id: clientId,
        }
      });
    }
    catch (error) {
      this.logger.error('Error deleting client');    }
  }

  async deleteClientBasedOnIntraId(
    intraId: number,
  ): Promise<void> {
    try {
      await this.prisma.client.delete({
        where: {
          client.intraId: intraId
        }
      });
    }
    catch (error) {
      this.logger.error('Error deleting client');    }
  }
}


