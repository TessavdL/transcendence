import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDMChannelDto {
	@IsString()
	@IsNotEmpty()
	otherUserId: string;
}