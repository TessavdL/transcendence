import { IsString, IsNotEmpty } from 'class-validator';

export class DeletePasswordDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

