import { Redis } from '@upstash/redis';

// Initialize the Redis client using environment variables
export const redis = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || '').replace(/['"]/g, ''),
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').replace(/['"]/g, ''),
});
