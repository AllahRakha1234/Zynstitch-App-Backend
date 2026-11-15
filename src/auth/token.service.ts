import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import type { UserRole, UserStatus } from '../common/types/authenticated-user.js';
import { parseDurationToSeconds } from '../common/utils/duration.js';

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  jti: string;
  role: UserRole;
  status: UserStatus;
}

@Injectable()
export class TokenService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;
  readonly expiresInSeconds: number;

  constructor(configService: ConfigService) {
    const secret =
      configService.get<string>('jwt.secret') ??
      configService.getOrThrow<string>('JWT_SECRET');
    this.secret = new TextEncoder().encode(secret);
    this.expiresIn =
      configService.get<string>('jwt.expiresIn') ??
      configService.get<string>('JWT_EXPIRES_IN') ??
      '1h';
    this.expiresInSeconds = parseDurationToSeconds(this.expiresIn);
  }

  async signAccessToken(payload: {
    userId: string;
    role: UserRole;
    status: UserStatus;
  }): Promise<{ token: string; jti: string }> {
    const jti = randomUUID();
    const token = await new SignJWT({
      role: payload.role,
      status: payload.status,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.userId)
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);

    return { token, jti };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.secret, {
      algorithms: ['HS256'],
    });

    if (!payload.sub || !payload.jti) {
      throw new Error('Token is missing subject or jti');
    }

    return payload as AccessTokenPayload;
  }
}
