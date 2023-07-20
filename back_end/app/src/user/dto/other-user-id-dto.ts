import { IsNotEmpty, IsString } from "class-validator";

export class OtherUserIdDto {
	@IsNotEmpty()
	@IsString()
	otherUserId: string;
}
