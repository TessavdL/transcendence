import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class PromoteMemberToAdminDto {
	@IsString()
	@IsNotEmpty()
	channelName: string;

	@IsInt()
	@IsNotEmpty()
	otherIntraId: number;
}
