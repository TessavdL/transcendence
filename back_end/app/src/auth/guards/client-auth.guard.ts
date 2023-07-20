import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { UserSharedService } from 'src/user/user.shared.service';

@Injectable()
export class ClientGuard implements CanActivate {
    constructor(private readonly sharedService: UserSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const id: string = this.sharedService.clientIdToUserId.get(client.id);
        if (id !== undefined) {
            return true;
        }
        return false;
    }
}
