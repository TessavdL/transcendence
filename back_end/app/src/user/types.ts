import { FriendStatus, ActivityStatus } from "@prisma/client";

export interface userElement {
    avatar: string;
    intraId: number;
    username: string;
    activityStatus: ActivityStatus;
    blockedState: boolean;
    friendStatus: FriendStatus;
}
