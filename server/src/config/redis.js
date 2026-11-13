import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) {
        return null; // Stop retrying quickly to enable fallback queue runner
      }
      return 500;
    },
    enableOfflineQueue: false,
    lazyConnect: true
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    console.log('[Redis] Connected successfully. BullMQ queue enabled.');
  }).catch(() => {
    isRedisAvailable = false;
    console.log('[Redis] Not detected or unreachable. Using built-in Resilient In-Memory Queue Runner.');
  });

  redisClient.on('error', () => {
    isRedisAvailable = false;
  });
} catch {
  isRedisAvailable = false;
  console.log('[Redis] Initialized in resilient fallback mode.');
}

export { redisClient, isRedisAvailable };
