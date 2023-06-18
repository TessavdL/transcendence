export interface ChannelMode {
	PRIVATE: 'PRIVATE',
	PROTECTED: 'PROTECTED',
	PUBLIC: 'PUBLIC'
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
	isLink: boolean;
}

export interface User {
	intraId: number;
	name: string;
	avatar: string;
}

export interface DMChannel {
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

export interface UserFromList {
	intraId: number;
	name: string;
	avatar: string;
	selected: boolean;
}