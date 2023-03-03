import { Module } from '@nestjs/common';
import { UserClientService } from './client.service';

@Module({
  providers: [UserClientService],
})
export class UserClientModule {}
