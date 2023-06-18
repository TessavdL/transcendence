import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { UserSharedService } from 'src/user/user.shared.service';

@Injectable()
export class ClientGuard implements CanActivate {
    constructor(private readonly sharedService: UserSharedService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        const intraId = this.sharedService.clientToIntraId.get(client.id);
        if (intraId !== undefined) {
            return true;
        }
        return false;
    }
}
