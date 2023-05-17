import { Injectable } from "@nestjs/common";
import { GameData } from "./types";

@Injectable()
export class SharedService {
	clientToIntraId: Map<string, number> = new Map<string, number>();
	gameData: Map<string, GameData> = new Map<string, GameData>();
}
