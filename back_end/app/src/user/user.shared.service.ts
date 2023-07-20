import { Injectable } from "@nestjs/common";

@Injectable()
export class UserSharedService {
    clientIdToUserId: Map<string, string> = new Map<string, string>();
}
