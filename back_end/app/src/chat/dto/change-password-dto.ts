import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	oldPassword: string;

	@IsString()
	@IsNotEmpty()
	@Length(4)
	newPassword: string;
}
