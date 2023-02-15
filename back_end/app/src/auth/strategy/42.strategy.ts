import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
// import { PrismaService } from "src/prisma/prisma.service";
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

	async validate(accessToken: string, refreshToken: string, profile): Promise<any> {
		// console.log("do we get here");
		// console.log(profile.username);
		// console.log(profile.intraid);
		
		// const user = await this.prisma.user.findUnique({
		// 	where: {
		// 		intraId: profile.intraid,
		// 	}
		// })
		// if (!user)
		// {
		// 	console.log("we're creating a user")
		// 	try {
		// 		this.prisma.user.create({
		// 			data: {
		// 				name: profile.username,
		// 				intraId: profile.intraid,
		// 				intraName: profile.username,
		// 			}
		// 		});
		// 	}
		// 	catch (s :any) {
		// 		console.log("any");
		// 		console.log(s);
		// 	}
		// }
		// console.log("returning user");
		// if (!user) {
		// 	console.log("oops no user");
		// }
		const user = await this.authService.findOrCreate(profile)
		return (user);
	}
}
