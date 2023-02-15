import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy) {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super ({
            clientID: config.get('42_OAUTH_UID'),
            clientSecret: config.get('42_OAUTH_SECRET'),
            callbackURL: "http://localhost:3001/auth/callback"
        });
    }

    async validate(accessToken: string, refreshToken: string, profile, callback) {
        const user = await this.prisma.user.findUnique({
            where: {
                // intraID: profile.id,
            }
        })
    }
}
