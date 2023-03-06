import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  @Post('createRoom')
  createRoom() {
	// database stuff here instead of hard coded room number of course
    const id = 1;
    console.log('creating room');
    return id;
  }
}
