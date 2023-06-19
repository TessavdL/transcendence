import { IsString, IsNotEmpty, Length } from 'class-validator';

export class DeletePasswordDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	@Length(4)
	password: string;
}

