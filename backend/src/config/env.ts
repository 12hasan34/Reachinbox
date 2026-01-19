import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  DB_HOST: process.env.DB_HOST!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: Number(process.env.REDIS_PORT!),
  MAX_EMAILS_PER_HOUR: Number(process.env.MAX_EMAILS_PER_HOUR!),
  EMAIL_MIN_DELAY_MS: Number(process.env.EMAIL_MIN_DELAY_MS!)
};