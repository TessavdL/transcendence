import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	oldPassword: string;

	@IsString()
	@IsNotEmpty()
	newPassword: string;
}
