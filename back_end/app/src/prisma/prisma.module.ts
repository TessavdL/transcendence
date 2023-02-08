import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// deprecation warning implicit coercion to integer for exit code is deprecated
// make sure you are exporting the array of services when using global
// make sure global module is importing into the app module
// https://github.com/prisma/prisma/issues/17127
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
