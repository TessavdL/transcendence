import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
// without Message it can no longer find the name
import { Message } from './entities/message.entity';
// import { UserMessage } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
	constructor(private prisma: PrismaService) {}
	clientToUser = {};

	identify(name: string, clientId: string) {
		this.clientToUser[clientId] = name;
		return Object.values(this.clientToUser);
	}

	getClientName(clientId: string) {
		return this.clientToUser[clientId];
	}
	
	async create(createMessageDto: CreateMessageDto) {
		const message = createMessageDto;

		const userMessage = await this.prisma.userMessage.create({
			data: {
				name: createMessageDto.name,
				text: createMessageDto.text,
			}
		});

		// console.log(message);
		return message;
	}

	async findAll() {
		const allUserMessages = await this.prisma.userMessage.findMany();
		// console.log(allUserMessages);
		return allUserMessages;
	}

	join() {
		return 'This action joins a room';
	}

	typing() {
		return 'This action shows if the user is typing';
	}
}
