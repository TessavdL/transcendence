// import { Provider } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { ChatGateway } from '../chat/chat.gateway';
// import { AuthService } from 'src/auth/auth.service';
// import { ChatService } from 'src/chat/chat.service';
// import { JwtStrategy } from 'src/auth/strategy';
// import { GameSharedService } from 'src/game/game.shared.service';
// import { SharedService } from 'src/chat/chat.map.shared.service';
// import { UserService } from 'src/user/user.service';

// export const chatGatewayProvider: Provider = {
//     provide: ChatGateway,
//     useFactory: (
//         authService: AuthService,
//         chatService: ChatService,
//         configService: ConfigService,
//         jwtStrategy: JwtStrategy,
//         gameSharedService: GameSharedService,
//         sharedService: SharedService,
//         userService: UserService,
//     ) => {
//         const origin = `http://${globalThis.host}:5173`;
//         const gateway = new ChatGateway(
//             authService,
//             chatService,
//             configService,
//             jwtStrategy,
//             gameSharedService,
//             sharedService,
//             userService,
//         );
//         gateway.server.set

//         gateway.server.({
//             cors: {
//                 origin,
//                 credentials: true,
//             },
//         });
//         return gateway;
//     },
//     inject: [ConfigService],
// };