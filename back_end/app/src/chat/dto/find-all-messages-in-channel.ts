import { IsString, IsNotEmpty } from 'class-validator';

export class FindAllMessagesDto {
    @IsString()
    @IsNotEmpty()
    channelName: string;
}
