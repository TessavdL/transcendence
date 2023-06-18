import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatSharedService {
    clientToIntraId: Map<string, number> = new Map<string, number>();
}