import IORedis from "ioredis";
import { env } from "./env";

export const rateLimitRedis = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});
