import { HOST } from "@/constants/constants";

export enum BadgesType {
    WON_GAME,
    WON_3GAME,
    WON_3GAME_ROW,
    LOSE_GAME,
    LOSE_3GAME,
    PLAYED_GAME,
    CHANGE_NAME,
    UPLOAD_AVATAR,
    ADDED_2FA,
    RANK1
}

const urlBadges = `http://${HOST}:5173/src/assets/badges/`;

export function badgesPicture(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.WON_GAME:
            return urlBadges + "won_game.png";
        case BadgesType.WON_3GAME:
            return urlBadges + "won_3game.png";
        case BadgesType.WON_3GAME_ROW:
            return urlBadges + "won_3game_row.png";
        case BadgesType.LOSE_GAME:
            return urlBadges + "lose_game.png";
        case BadgesType.LOSE_3GAME:
            return urlBadges + "lose_3game.png";
        case BadgesType.PLAYED_GAME:
            return urlBadges + "played_game.png";
        case BadgesType.CHANGE_NAME:
            return urlBadges + "change_name.png";
        case BadgesType.UPLOAD_AVATAR:
            return urlBadges + "upload_avatar.png";                                
        case BadgesType.ADDED_2FA:
            return urlBadges + "added_2fa.png";
        case BadgesType.RANK1:
            return urlBadges + "rank1.png";
        default:
            return "no badge pic";
    }
}

export function badgesTitle(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.WON_GAME:
            return "GOOOAAAL!";
        case BadgesType.WON_3GAME:
            return "Adept";
        case BadgesType.WON_3GAME_ROW:
            return "You are a PRO!";
        case BadgesType.LOSE_GAME:
            return "Almost got it";
        case BadgesType.LOSE_3GAME:
            return "This is not Dark Soul";
        case BadgesType.PLAYED_GAME:
            return "Gamer";
        case BadgesType.CHANGE_NAME:
            return "Disguiser";
        case BadgesType.UPLOAD_AVATAR:
            return "What a nice Picture";                              
        case BadgesType.ADDED_2FA:
            return "Make it safe";
        case BadgesType.RANK1:
            return "Champion";
        default:
            return "no badge title";
    }
}

export function badgesdescription(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.WON_GAME:
            return "has won a game";
        case BadgesType.WON_3GAME:
            return "has won 3 or more games";
        case BadgesType.WON_3GAME_ROW:
            return "has won 3 games in a row";
        case BadgesType.LOSE_GAME:
            return "has lost a game";
        case BadgesType.LOSE_3GAME:
            return "has lost 3 or more games";
        case BadgesType.PLAYED_GAME:
            return "has played the Pong game";
        case BadgesType.CHANGE_NAME:
            return "has changed username";
        case BadgesType.UPLOAD_AVATAR:
            return "has uploaded an avatar";                              
        case BadgesType.ADDED_2FA:
            return "enable 2FA";
        case BadgesType.RANK1:
            return "1st on the ladder";
        default:
            return "";
    }
}
