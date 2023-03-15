export interface Channel {
    id: number;
    createdByIntraId: number;
    channelName: string;
}

export interface Messages {
    intraId: number;
    name: string;
    text: string;
}