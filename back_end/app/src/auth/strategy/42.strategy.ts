// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { User } from '@prisma/client';
// import { Strategy } from 'passport-42';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class Strategy42 extends PassportStrategy(Strategy, '42') {
// 	constructor(
// 		private readonly authService: AuthService,
// 		private readonly configService: ConfigService,
// 	) {
// 		super({
// 			clientID: configService.get('42_OAUTH_UID'),
// 			clientSecret: configService.get('42_OAUTH_SECRET'),
// 			callbackURL: `http://${process.env.HOST}:3001/auth/callback`,
// 			profileFields: {
// 				intraid: 'id',
// 				username: 'login',
// 			},
// 		});
// 	}

// 	async validate(
// 		accessToken: string,
// 		refreshToken: string,
// 		profile: any,
// 	): Promise<User> {
// 		const user = await this.authService.validateUser(profile);

// 		if (!user) {
// 			throw new UnauthorizedException();
// 		}
// 		return user;
// 	}
// }
