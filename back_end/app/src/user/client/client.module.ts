import { Module } from '@nestjs/common';
import { UserClientService } from './client.service';

@Module({
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}
