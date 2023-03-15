import { IsNotEmpty, IsNumber } from "class-validator";

export class OtherUserIntraDto {
	@IsNotEmpty()
	@IsNumber()
	otherIntraId: number;
}
