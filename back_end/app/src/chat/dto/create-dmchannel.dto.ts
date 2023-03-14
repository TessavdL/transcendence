import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateDMChannelDto {
	@IsInt()
	@IsNotEmpty()
	otherIntraId: number;
}