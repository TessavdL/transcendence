export enum ErrorType {
    GENERAL,
    FRIEND_SEND_REQUEST_FAILED,
    FRIEND_REJECT_REQUEST_FAILED,
    FRIEND_ADD_FRIEND_FAILED,
    FRIEND_REMOVE_FRIEND_FAILED,
}
  
export function errorMessage(errorType: ErrorType | undefined): string {
    switch (errorType) {
        case ErrorType.GENERAL:
            return "Opps, something went wrong, please retry";
        case ErrorType.FRIEND_ADD_FRIEND_FAILED:
            return " reject to become your friend";
        default:
            return "Friend request failed";
    }
}