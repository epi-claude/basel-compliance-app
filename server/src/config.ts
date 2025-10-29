import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  databasePath: process.env.DATABASE_PATH || './database/dev.db',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
