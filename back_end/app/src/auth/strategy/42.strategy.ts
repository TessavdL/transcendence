import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Strategy } from "passport-42";
import { AuthService } from "../auth.service";

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy) {
	constructor(config: ConfigService, private authService: AuthService) {
		super ({
			clientID: config.get('42_OAUTH_UID'),
			clientSecret: config.get('42_OAUTH_SECRET'),
			callbackURL: "http://localhost:3001/auth/callback",
			profileFields: {
				'intraid': 'id',
				'username': 'login',
			}
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<User> {
		console.log(profile.intraid, profile.username);
		const user = await this.authService.validateUser(profile);

		if (!user){
			throw new UnauthorizedException();
		}
		return (user);
	}
}
