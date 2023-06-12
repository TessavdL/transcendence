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
    CHANGE_PASSWORD_FAILED,
    REMOVE_PASSWORD_FAILED,
    SET_PASSWORD_FAILED,
    CHAT_FORBIDDEN,
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
        case ErrorType.CHANGE_PASSWORD_FAILED:
            return "Failed to change password";
        case ErrorType.REMOVE_PASSWORD_FAILED:
            return "Failed to remove password";
        case ErrorType.SET_PASSWORD_FAILED:
            return "Failed to set password";
        case ErrorType.CHAT_FORBIDDEN:
            return "You are not a member of this channel"
        default:
            return "Friend request failed";
    }
}