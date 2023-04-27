import { IsBoolean, IsNotEmpty } from "class-validator";

export class TwofaStatusDto {
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}
