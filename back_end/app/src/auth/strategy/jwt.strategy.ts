import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',) {
	constructor (config: ConfigService, private prisma: PrismaService) {
		super ({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get('JWT_SECRET'),
		});
	}

	async validate(payload: { name: string, sub: number }): Promise<User> {
		const user: User = await this.prisma.user.findUnique({
			where: {
				intraName: payload.name,
			}
		});
		if (!user) {
			throw new UnauthorizedException();
		}
		return (user);
	}
}
