import { validateEnv } from './env.validation.js';

export default () => {
  const env = validateEnv(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    mongo: {
      uri: env.MONGO_URI,
      dbName: env.DEFAULT_DB,
    },
    redis: {
      url: env.REDIS_URL,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      cookieName: env.JWT_COOKIE_NAME,
      cookieSecure: env.JWT_COOKIE_SECURE ?? env.NODE_ENV === 'production',
      cookieSameSite: 'lax' as const,
    },
    corsOrigin: env.CORS_ORIGIN,
  };
};
