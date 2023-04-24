import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { SharedService } from 'src/chat/chat.map.shared.service';

@Injectable()
export class ClientGuard implements CanActivate {
    constructor(private readonly sharedService: SharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const intraId = this.sharedService.clientToIntraId.get(client.id);
        if (intraId !== undefined) {
            return true;
        }
        return false;
    }
}
