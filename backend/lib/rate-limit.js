/**
 * 请求限流中间件
 * 基于 rate-limiter-flexible（内存模式），无需外部依赖
 */

const { RateLimiterMemory } = require('rate-limiter-flexible');

// 通用 API 限流
const apiLimiter = new RateLimiterMemory({
  points: parseInt(process.env.API_RATE_LIMIT) || 30, // 每分钟 30 次
  duration: 60,
  blockDuration: 60,
});

/**
 * 通用 API 限流中间件
 * 基于 IP 地址
 */
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  apiLimiter.consume(ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        retryAfter: 60,
      });
    });
}

module.exports = { rateLimit };
