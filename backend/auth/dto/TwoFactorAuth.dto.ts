import {IsNotEmpty, IsString, Length} from "class-validator"
export class TwoFactorAuthenticationCode{
    @IsNotEmpty()
    @IsString()
    @Length(6,6)
    twoFactorAuthenticationCode: string
}