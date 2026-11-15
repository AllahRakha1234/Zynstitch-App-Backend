import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Redis } from 'ioredis';
import {
  REDIS_CLIENT,
  createRedisKey,
  type RedisKeyType,
} from './redis.constants.js';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(
    type: RedisKeyType,
    identifier: string,
    value: string,
    ttlInSeconds?: number,
  ): Promise<void> {
    const key = createRedisKey(type, identifier);
    if (ttlInSeconds) {
      await this.client.set(key, value, 'EX', ttlInSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  get(type: RedisKeyType, identifier: string): Promise<string | null> {
    return this.client.get(createRedisKey(type, identifier));
  }

  async del(type: RedisKeyType, identifier: string): Promise<void> {
    await this.client.del(createRedisKey(type, identifier));
  }
}
