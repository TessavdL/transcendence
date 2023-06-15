import { Injectable } from "@nestjs/common";

@Injectable()
export class UserSharedService {
    clientToIntraId: Map<string, number> = new Map<string, number>();
}
