import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  domain: process.env.APP_DOMAIN || 'lsjyapp.cn',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '2h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
}));
