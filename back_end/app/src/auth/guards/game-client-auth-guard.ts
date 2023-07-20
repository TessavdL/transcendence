import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { GameSharedService } from 'src/game/game.shared.service';

@Injectable()
export class GameClientGuard implements CanActivate {
    constructor(private readonly gameSharedService: GameSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const id: string = this.gameSharedService.clientToUserId.get(client.id);
        if (id !== undefined) {
            return true;
        }
        return false;
    }
}
