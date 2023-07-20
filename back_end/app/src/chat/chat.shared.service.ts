import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatSharedService {
    clientIdToUserId: Map<string, string> = new Map<string, string>();
}