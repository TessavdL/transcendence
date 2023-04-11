import { FriendStatus, ActivityStatus } from "@prisma/client";

export interface UserElement {
	avatar: string;
	intraId: number;
	username: string;
	activityStatus: ActivityStatus;
	blockedState: boolean;
	friendStatus: FriendStatus;
}

export interface FriendRequestList {
	intraId: number;
	username: string;
	avatar: string;
}
