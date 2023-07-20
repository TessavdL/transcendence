import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { MatchmakingSharedService } from 'src/game/matchmaking/matchmaking.shared.service';

@Injectable()
export class MatchmakingClientGuard implements CanActivate {
    constructor(private readonly matchMakingSharedService: MatchmakingSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const id: string = this.matchMakingSharedService.clientToUserId.get(client.id);
        if (id !== undefined) {
            return true;
        }
        return false;
    }
}
