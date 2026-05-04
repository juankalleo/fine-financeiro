import Redis from 'ioredis';

const redisUrl = process.env.finedb_REDIS_URL || process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('REDIS_URL or finedb_REDIS_URL not found in environment variables');
}

export const redis = new Redis(redisUrl || '');

export default redis;
