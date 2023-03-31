import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveUserFromChannelDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;
}
