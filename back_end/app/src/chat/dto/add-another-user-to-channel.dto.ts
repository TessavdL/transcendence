import { IsString, IsNotEmpty } from 'class-validator';

export class AddAnotherUserToChannelDto {
    @IsString()
    @IsNotEmpty()
    channelName: string;

    @IsString()
    @IsNotEmpty()
    otherUserId: string;
}
