import { IsString, IsNotEmpty } from 'class-validator';

export class PromoteMemberToAdminDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsString()
	@IsNotEmpty()
	otherUserId: string;
}
