export interface Channel {
	id: number;
	createdByIntraId: number;
	channelName: string;
}

export interface Messages {
	intraId: number;
	name: string;
	text: string;
}

export interface User {
	intraId: number;
	name: string;
}

export interface DMChannel {
	id: number;
	otherIntraId: number;
	channelName: string;
}
