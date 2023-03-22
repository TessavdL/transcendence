export interface Messages {
	intraId: number;
	name: string;
	text: string;
}

export interface Member {
	intraId: number;
	name: string;
	avatar: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
}
