import { IsString, IsNotEmpty, IsEnum, IsOptional, Matches, Length } from 'class-validator';

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
	@Matches(/^[\x20-\x7E]+$/, {
		message: 'Channel name can only contain valid characters',
	})
	@Length(1, 20, {
		message: 'Channel name must be between 1 and 20 characters long',
	})
	channelName: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	password?: string;
}
