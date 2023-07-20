type ActiveStatus = "ONLINE" | "INGAME" | "OFFLINE";
type FriendStatus = "NOT_FRIENDS" | "PENDING" | "FRIENDS";

export default interface UserInfo {
    avatar: null | string,
    name: string,
    activityStatus: ActiveStatus,
    blockedState: boolean,
    friendStatus: FriendStatus,
}
