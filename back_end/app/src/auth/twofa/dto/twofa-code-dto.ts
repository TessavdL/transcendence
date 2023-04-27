import { IsNotEmpty, IsNumberString, Length } from "class-validator";

export class TwofaCodeDto {
    @IsNotEmpty()
    @IsNumberString()
    @Length(6, 6)
    code: number;
}