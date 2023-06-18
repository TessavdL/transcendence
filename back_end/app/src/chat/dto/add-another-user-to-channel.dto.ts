import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddAnotherUserToChannelDto {
    @IsString()
    @IsNotEmpty()
    channelName: string;

    @IsNumber()
    @IsNotEmpty()
    otherIntraId: number;
}
