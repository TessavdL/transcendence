import { FriendStatus, ActivityStatus } from "@prisma/client";

export interface userElement {
    avatar: string;
    username: string;
    activityStatus: ActivityStatus;
    blockedState: boolean;
    friendStatus: FriendStatus;
}
