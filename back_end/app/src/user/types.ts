import { FriendStatus, ActivityStatus } from "@prisma/client";

export interface UserElement {
	avatar: string;
	id: string;
	name: string;
	activityStatus: ActivityStatus;
	blockedState: boolean;
	friendStatus: FriendStatus;
}

export interface FriendRequestList {
	id: string;
	name: string;
	avatar: string;
}
