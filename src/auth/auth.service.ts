import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as bycrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerData: RegisterDto) {
    try {
      // SELECT * FROM USER WHERE email=? OR username=?
      const existUser = await this.prismaService.user.findFirst({
        where: {
          OR: [
            { email: registerData.email },
            { username: registerData.username },
          ],
        },
      });

      if (existUser) {
        throw new ConflictException(
          'Email or username is already teken before',
        );
      }
      const hashedPassword = await bycrypt.hash(registerData.password, 10);
      const newUserData = {
        ...registerData,
        password: hashedPassword,
      };
      const user = await this.prismaService.user.create({
        data: newUserData,
      });
      return user;
    } catch (e) {
      throw e;
    }
  }
  async login(loginData: LoginDto) {
    const existUser = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { email: loginData.identifier },
          { username: loginData.identifier },
        ],
      },
    });
    if (!existUser) {
      throw new UnauthorizedException(
        'username or email or password incorrect ',
      );
    }
    const isPasswordCorrect = await bycrypt.compare(
      loginData.password,
      existUser.password,
    );
    if (isPasswordCorrect) {
      const session = await this.prismaService.session.create({
        data: {
          userId: existUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          refreshTokenHash: '',
        },
      });
      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(
          {
            userId: existUser.id,
            role: existUser.role,
            sid: session.id,
          },
          {
            expiresIn: '15m',
          },
        ),

        this.jwtService.signAsync(
          {
            userId: existUser.id,
            sid: session.id,
          },
          {
            expiresIn: '7d',
          },
        ),
      ]);
      const hashedRefreshToken = this.hash(refresh_token);
      await this.prismaService.session.update({
        where: {
          id: session.id,
        },
        data: {
          refreshTokenHash: hashedRefreshToken,
        },
      });
      return { access_token, refresh_token };
    } else {
      throw new UnauthorizedException(
        'username or email or password incorrect ',
      );
    }
  }

  async getMyProfile(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      omit: {
        password: true,
      },
    });
    if (user) {
      return user;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const session = await this.prismaService.session.findUnique({
      where: {
        id: payload.sid,
      },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }
    if (session.refreshTokenHash !== this.hash(refreshToken)) {
      await this.prismaService.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException();
    }
    const existUser = await this.prismaService.user.findUnique({
      where: { id: payload.userId },
    });
    if (!existUser) {
      throw new NotFoundException();
    }
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: existUser.id,
          role: existUser.role,
          sid: session.id,
        },
        {
          expiresIn: '15m',
        },
      ),

      this.jwtService.signAsync(
        {
          userId: existUser.id,
          sid: session.id,
        },
        {
          expiresIn: '7d',
        },
      ),
    ]);
    const hashedRefreshToken = this.hash(refresh_token);
    await this.prismaService.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { access_token, refresh_token };
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
  logout(sid: number) {
    return this.prismaService.session.update({
      where: { id: sid },
      data: { revokedAt: new Date() },
    });
  }
  logoutOthers(userId: number, currentSid: number) {
    return this.prismaService.session.updateMany({
      where: { userId, id: { not: currentSid }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
