import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { UserMessage } from '@prisma/client';

@Injectable()
export class MessagesService {
	messages: Message[] = [];
	clientToUser = {};

	identify(name: string, clientId: string) {
		this.clientToUser[clientId] = name;
		return Object.values(this.clientToUser);
	}

	getClientName(clientId: string) {
		return this.clientToUser[clientId];
	}
	
	create(createMessageDto: CreateMessageDto) {
		const message = {...createMessageDto};
		this.messages.push(createMessageDto);
		console.log(message);
		return message;
	}

	findAll() {
		return this.messages;
	}

	join() {
		return 'This action joins a room';
	}

	typing() {
		return 'This action shows if the user is typing';
	}
}
