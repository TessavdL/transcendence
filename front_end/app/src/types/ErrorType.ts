export enum ErrorType {
    GENERAL,
    FRIEND_SEND_REQUEST_FAILED,
    FRIEND_REJECT_REQUEST_FAILED,
    FRIEND_ADD_FRIEND_FAILED,
    FRIEND_REMOVE_FRIEND_FAILED,
    CREATE_CHANNEL_FAILED,
    JOIN_CHANNEL_FAILED,
    LOAD_CHANNEL_MEMBERS_FAILED,
    LOAD_MSG_FAILED,
    SEND_MSG_FAILED,
    CHANGE_NAME_FAILED,
    CHANGE_AVATAR_FAILED,
}
  
export function errorMessage(errorType: ErrorType | undefined): string {
    switch (errorType) {
        case ErrorType.GENERAL:
            return "Opps, something went wrong, please retry";
        case ErrorType.FRIEND_ADD_FRIEND_FAILED:
            return " reject to become your friend";
        case ErrorType.CREATE_CHANNEL_FAILED:
            return "Failed to create channel";
        case ErrorType.JOIN_CHANNEL_FAILED:
            return "Failed to join channel";
        case ErrorType.LOAD_CHANNEL_MEMBERS_FAILED:
            return "Failed to load members of the channel";
        case ErrorType.LOAD_MSG_FAILED:
            return "Failed to load messages";
        case ErrorType.SEND_MSG_FAILED:
            return "Failed to send messages";
        case ErrorType.CHANGE_NAME_FAILED:
            return "Failed to change user name";
        case ErrorType.CHANGE_AVATAR_FAILED:
            return "Failed to change avatar";
        default:
            return "somethin went wrong";
    }
}