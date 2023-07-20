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
	id: string;
	name: string;
	avatar: string;
	text: string;
	isLink: boolean;
}

export interface User {
	id: string;
	name: string;
	avatar: string;
}

export interface DMChannel {
	channelName: string;
	otherUserAvatar: string;
	otherUserId: string;
	otherUserName: string;
}

export interface Member {
	id: string;
	name: string;
	avatar: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface Punishment {
	status: boolean;
	time: number | null;
}

export interface UserFromList {
	id: string;
	name: string;
	avatar: string;
	selected: boolean;
}