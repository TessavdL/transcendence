import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { ChatSharedService } from 'src/chat/chat.shared.service';

@Injectable()
export class ChatClientGuard implements CanActivate {
    constructor(private readonly sharedService: ChatSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const intraId = this.sharedService.clientToIntraId.get(client.id);
        if (intraId !== undefined) {
            return true;
        }
        return false;
    }
}
