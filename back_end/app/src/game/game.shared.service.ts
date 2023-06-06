import { Injectable } from "@nestjs/common";
import { Players } from "./types";

@Injectable()
export class GameSharedService {
	clientToIntraId: Map<string, number> = new Map<string, number>();
	playerData: Map<string, Players> = new Map<string, Players>();
}
