import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
          (request: Request) => {
            const token = request?.cookies['jwt'];
            return token;
          },
        ]),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
      signOptions: {
        expiresIn: '24h',
      },
    });
  }

  async validate(payload: { name: string; sub: string }): Promise<User> {
    console.log("in validate", payload);
    const user: User = await this.authService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
