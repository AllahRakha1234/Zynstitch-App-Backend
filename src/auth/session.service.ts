import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  persistJwt(
    userId: string,
    jti: string,
    token: string,
    ttlInSeconds: number,
  ): Promise<void> {
    return this.redisService.set(
      'session-token',
      this.identifier(userId, jti),
      token,
      ttlInSeconds,
    );
  }

  getJwt(userId: string, jti: string): Promise<string | null> {
    return this.redisService.get('session-token', this.identifier(userId, jti));
  }

  revokeJwt(userId: string, jti: string): Promise<void> {
    return this.redisService.del('session-token', this.identifier(userId, jti));
  }

  async isJwtActive(
    userId: string,
    jti: string,
    token: string,
  ): Promise<boolean> {
    const stored = await this.getJwt(userId, jti);
    return stored === token;
  }

  private identifier(userId: string, jti: string) {
    return `${userId}:${jti}`;
  }
}
