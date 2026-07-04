/**
 * 验证码缓存模块
 * 优先使用 Redis，不可用时降级为内存缓存
 */

const Redis = require('ioredis');

let redis = null;
const memoryStore = new Map();

async function initRedis() {
  try {
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) return null; // 降级到内存
          return Math.min(times * 200, 2000);
        },
      });
      redis.on('error', () => { redis = null; });
      await redis.ping();
      console.log('[Cache] Redis 连接成功');
    }
  } catch (e) {
    console.log('[Cache] Redis 不可用，使用内存缓存');
    redis = null;
  }
}

function getMemoryKey(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expireAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function setMemoryKey(key, value, ttlSeconds) {
  memoryStore.set(key, {
    value,
    expireAt: Date.now() + ttlSeconds * 1000,
  });
  // 自动清理过期条目（每 5 分钟）
  setTimeout(() => {
    const entry = memoryStore.get(key);
    if (entry && Date.now() > entry.expireAt) memoryStore.delete(key);
  }, ttlSeconds * 1000);
}

function delMemoryKey(key) {
  memoryStore.delete(key);
}

/**
 * 存储验证码
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @param {number} ttl 有效期（秒）
 */
async function setCode(phone, code, ttl = 300) {
  const key = `sms:code:${phone}`;
  if (redis) {
    await redis.set(key, code, 'EX', ttl);
  } else {
    setMemoryKey(key, code, ttl);
  }
}

/**
 * 校验验证码
 */
async function verifyCode(phone, code) {
  const key = `sms:code:${phone}`;
  let stored = redis ? await redis.get(key) : getMemoryKey(key);
  if (stored === code) {
    if (redis) await redis.del(key);
    else delMemoryKey(key);
    return true;
  }
  return false;
}

/**
 * 检查发送频率
 */
async function checkRateLimit(phone) {
  const key = `sms:rate:${phone}`;
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    return count > 1;
  } else {
    const entry = getMemoryKey(key);
    if (entry) return true; // 60 秒内已发送
    setMemoryKey(key, '1', 60);
    return false;
  }
}

/**
 * 通用缓存 get/set/del
 */
async function cacheGet(key) {
  return redis ? await redis.get(key) : getMemoryKey(key);
}

async function cacheSet(key, value, ttl = 300) {
  if (redis) {
    await redis.set(key, value, 'EX', ttl);
  } else {
    setMemoryKey(key, value, ttl);
  }
}

async function cacheDel(key) {
  if (redis) await redis.del(key);
  else delMemoryKey(key);
}

module.exports = { initRedis, setCode, verifyCode, checkRateLimit, cacheGet, cacheSet, cacheDel };
