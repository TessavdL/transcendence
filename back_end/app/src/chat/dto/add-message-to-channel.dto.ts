import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class AddMessageToChannelDto {
	@IsInt()
	@IsNotEmpty()
	intraId: number;

	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	text: string;
}
