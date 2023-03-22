import { IsString, IsNotEmpty } from 'class-validator';

export class AddUserToChannelDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;
}