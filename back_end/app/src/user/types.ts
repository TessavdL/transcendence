export enum FriendState {
    NOT_FRIENDS,
    PENDING,
    FRIENDS,
}

export enum ActivityStatus {
    ONLINE,
    INGAME,
    OFFLINE,
}

export interface userElement {
    avatar: string;
    username: string;
    activityStatus: ActivityStatus;
    blockedState: boolean;
    friendState: FriendState;
}
