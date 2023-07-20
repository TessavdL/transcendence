import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateName {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
    name: string;
}
