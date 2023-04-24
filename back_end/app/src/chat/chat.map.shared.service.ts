import { Injectable } from "@nestjs/common";

@Injectable()
export class SharedService {
    clientToIntraId: Map<string, number> = new Map<string, number>();
    channelToClientIds: Map<string, string[]> = new Map<string, string[]>();
}