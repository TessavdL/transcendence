import { IsNotEmpty } from "class-validator";

export class AuthDto {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	password: string;
}
