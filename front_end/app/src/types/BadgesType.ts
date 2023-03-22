export enum BadgesType {
    CAHMP,
    SUPER_WINNER,
    SUPER_LOSSER,
}

const urlBadges = "http://localhost:5173/src/assets/badges/";

export function badgesPicture(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.CAHMP:
            return urlBadges + "champ.png";
        case BadgesType.SUPER_WINNER:
            return urlBadges + "super_winner.png";
        case BadgesType.SUPER_LOSSER:
            return urlBadges + "super_loser.png";
        default:
            return "no badge pic";
    }
}

export function badgesTitle(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.CAHMP:
            return "Championship";
        case BadgesType.SUPER_WINNER:
            return "Super Winner";
        case BadgesType.SUPER_LOSSER:
            return "Super Losser";
        default:
            return "no badge title";
    }
}

export function badgesdescription(badgeType: BadgesType | undefined): string {
    switch (badgeType) {
        case BadgesType.CAHMP:
            return "first on ladder";
        case BadgesType.SUPER_WINNER:
            return "win 5 times in a row";
        case BadgesType.SUPER_LOSSER:
            return "lose 5 times in a row";
        default:
            return "";
    }
}
