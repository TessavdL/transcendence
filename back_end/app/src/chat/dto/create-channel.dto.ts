import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;
}