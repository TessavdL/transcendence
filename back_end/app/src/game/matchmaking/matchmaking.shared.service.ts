import { Injectable } from "@nestjs/common";

@Injectable()
export class MatchmakingSharedService {
	clientToIntraId: Map<string, number> = new Map<string, number>();
}
