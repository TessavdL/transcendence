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

export interface Message {
	channelName: string;
	intraId: number;
	name: string;
	avatar: string;
	text: string;
}

export interface User {
	intraId: number;
	name: string;
	avatar: string;
}

export interface DMInfo {
	channelName: string;
	otherUserAvatar: string;
	otherUserIntraId: number;
	otherUserName: string;
}

export interface Member {
	intraId: number;
	name: string;
	avatar: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface Punishment {
	status: boolean;
	time: number | null;
}