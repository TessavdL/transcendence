import { Injectable } from "@nestjs/common";

@Injectable()
export class SharedService {
    clientToIntraId: Map<string, number> = new Map<string, number>();
}