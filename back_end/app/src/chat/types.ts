import { Channel, User } from "@prisma/client";

export interface Member {
	intraId: number;
	name: string;
	avatar: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface Message {
	channelName: string;
	intraId: number;
	name: string;
	avatar: string;
	text: string;
	isLink: boolean;
}

export interface DMChannel {
	channel: Channel;
	otherUser: User;
	user: User;
}

export type Punishment = {
	status: boolean,
	time: number | null,
}