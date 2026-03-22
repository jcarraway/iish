import Redis from 'ioredis';

let _redis: Redis;
export function getRedis() {
  if (!_redis) _redis = new Redis(process.env.REDIS_URL!);
  return _redis;
}

/** @deprecated Use getRedis() instead */
export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    const r = getRedis();
    const val = (r as any)[prop];
    return typeof val === 'function' ? val.bind(r) : val;
  },
});
