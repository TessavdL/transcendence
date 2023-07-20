import { Injectable } from "@nestjs/common";
import { Players } from "./types";

@Injectable()
export class GameSharedService {
	clientToUserId: Map<string, string> = new Map<string, string>();
	playerData: Map<string, Players> = new Map<string, Players>();
}
