export enum ChannelMode {
    PRIVATE,
	PROTECTED, 
	PUBLIC
}

export interface Channel {
	id: number;
	channelName: string;
	channelType: string;
	channelMode: string;
}

export interface Messages {
	intraId: number;
	name: string;
	text: string;
}

export interface User {
	intraId: number;
	name: string;
	avatar: string;
}
