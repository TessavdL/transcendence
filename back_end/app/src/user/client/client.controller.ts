import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Client, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserClientService } from './client.service';

/*
model Client {
	id      String @unique
	intraId Int @unique
}
*/

@UseGuards(JwtAuthGuard)
@Controller('user/client')
export class UserClientController {
  constructor(private userClientService: UserClientService) {}

  @Post('/')
  createClient(clientId: string, userIntraId: number): Promise<void> {
    return this.userClientService.createClient(clientId, userIntraId);
  }

  @Put('/')
  updateClientId(clientId: string, userIntraId: number): Promise<void> {
    return this.userClientService.updateClientId(clientId, userIntraId);
  }

  @Get('/intraId')
  getClientIntraId(clientId: string): Promise<number> {
    return this.userClientService.getClientIntraId(clientId);
  }

  @Get('/clientId')
  getClientId(intraId: number): Promise<string> {
    return this.userClientService.getClientId(intraId);
  }

  @Get('/')
  getClient(@Req() request): Promise<Client> {
    const user: User = request.user;
    return this.userClientService.getClient(user.intraId);
  }

  @Delete('/')
  deleteClientBasedOnId(clientId: string): Promise<void> {
    return this.userClientService.deleteClientBasedOnId(clientId);
  }

  @Delete('/')
  deleteClientBasedOnIntraId(intraId: number): Promise<void> {
    return this.userClientService.deleteClientBasedOnIntraId(intraId);
  }
}
