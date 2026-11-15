export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export type RedisKeyType = 'session-token' | 'api-rate-limit';

export function createRedisKey(
  type: RedisKeyType,
  identifier: string,
): `${RedisKeyType}:${string}` {
  return `${type}:${identifier}`;
}
