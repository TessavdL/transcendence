import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { MatchmakingSharedService } from 'src/game/matchmaking/matchmaking.shared.service';

@Injectable()
export class MatchmakingClientGuard implements CanActivate {
    constructor(private readonly matchMakingSharedService: MatchmakingSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const intraId = this.matchMakingSharedService.clientToIntraId.get(client.id);
        if (intraId !== undefined) {
            return true;
        }
        return false;
    }
}
