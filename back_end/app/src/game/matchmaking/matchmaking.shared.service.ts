import { Injectable } from "@nestjs/common";

@Injectable()
export class MatchmakingSharedService {
	clientToUserId: Map<string, string> = new Map<string, string>();
}
