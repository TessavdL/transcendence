import { Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger: Logger = new Logger('AuthService');

  async validateUser(profile: any): Promise<User> | null  {
    const user: User = await this.findUserById(profile.intraid);
    if (!user) {
      return (this.createUser(profile));
    }

    return (user);
  }

  async findUserById(id: number): Promise<User> | null {
    const user: User = await this.prisma.user.findUnique({
      where: {
        intraId: id
      }
    });

    return (user);
  }

  async createUser(profile: any): Promise<User> | null {
    const user: User = await this.prisma.user.create({
      data: {
        name: profile.username,
        intraId: profile.intraid,
        intraName: profile.username,
      }
    });

    return (user);
  }

  async setBearerToken(user: User, @Res({ passthrough:true }) res: Response): Promise<void> {
    console.log(`Hello ${user.intraName}, you have logged in!`);
    
    const token = await this.signToken(user);
    
    res.cookie('jwt', token.access_token, { httpOnly:true, domain:'localhost' });
    res.redirect('http://localhost:5173');
  }

  async signToken(user: User): Promise<{access_token: string}> {
    const payload = { name: user.intraName, sub: user.intraId };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
        secret:  this.configService.get('JWT_SECRET'),
      })
    };
  }

  getToken(client: Socket): string {
    const cookieToken = client.handshake.headers.cookie;
	if (!cookieToken) {
		throw new Error('Could not find a token');
	}

	const token = cookieToken.split(';').find((cookie: string) => cookie.startsWith('jwt=')).split('=')[1];
    if (!token) {
       throw new Error('Could not find jwt token');
    }
	return (token);
  }

  async verifyToken(token: string): Promise<{ name: string, sub: number }> {
    try {
      const secret: string = this.configService.get('JWT_SECRET');
  
      const payload: any = await this.jwtService.verify(token, {secret: secret, clockTolerance: 100});
  
      const name: string = payload.name;
      const sub: number = payload.sub;
      return { name, sub };
    }
    catch (error) {
      this.logger.error('Token is invalid')
      throw new Error(error);
    }
  }

  logout(user: User, @Res({ passthrough:true }) res: Response) {
    console.log(`Hello ${user.intraName}, you are logged out!`);

    res.cookie('jwt', '', { httpOnly:true, domain:'localhost' });
    // TO DO: needs to redirect to login page
    res.redirect('http://localhost:5173');
  }
}
