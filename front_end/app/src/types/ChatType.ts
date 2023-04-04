export interface Channel {
	id: number;
	channelName: string;
	channelType: string;
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