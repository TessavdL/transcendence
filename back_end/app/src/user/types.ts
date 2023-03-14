import { FriendStatus, ActivityStatus } from "@prisma/client";

export interface UserElement {
	avatar: string;
	username: string;
	activityStatus: ActivityStatus;
	blockedState: boolean;
	friendStatus: FriendStatus;
}
