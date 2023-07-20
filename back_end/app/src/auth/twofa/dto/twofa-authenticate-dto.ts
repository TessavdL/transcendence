import { IsNotEmpty, IsString, IsNumberString, Length } from "class-validator";

export class TwofaAuthenticateDto {
    @IsNotEmpty()
    @IsNumberString()
    @Length(6, 6)
    code: string;

    @IsNotEmpty()
    @IsString()
    id: string;
}
