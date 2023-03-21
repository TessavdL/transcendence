import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

enum ChannelMode {
	PRIVATE = 'PRIVATE',
	PROTECTED = 'PROTECTED',
	PUBLIC = 'PUBLIC',
}

export class CreateChannelDto {
	@IsEnum(ChannelMode, {
		message: 'Access level must be one of: PRIVATE, PROTECTED, PUBLIC',
	})
	channelMode: ChannelMode;

	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	password?: string;
}
