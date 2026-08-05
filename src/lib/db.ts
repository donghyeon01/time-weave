import mongoose, { type Mongoose } from "mongoose";
import { createClient } from "redis";
import { AppError } from "@/lib/error";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __mongoose: Mongoose | undefined;
  var __redisClient: RedisClient | undefined;
}

let cachedMongoose: Mongoose | undefined = globalThis.__mongoose;
let cachedRedisClient: RedisClient | undefined = globalThis.__redisClient;

export async function getMongoose(): Promise<Mongoose> {
  if (cachedMongoose?.connection?.readyState === 1) {
    return cachedMongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new AppError(
      "MONGODB_URI 환경변수가 설정되지 않았습니다.",
      500,
      "ENV_MISSING",
    );
  }

  await mongoose.connect(uri);
  cachedMongoose = mongoose;
  globalThis.__mongoose = cachedMongoose;
  return cachedMongoose;
}

export async function getRedisClient(): Promise<RedisClient> {
  if (cachedRedisClient?.isOpen) {
    return cachedRedisClient;
  }

  const uri = process.env.REDIS_URI;
  if (!uri) {
    throw new AppError(
      "REDIS_URI 환경변수가 설정되지 않았습니다.",
      500,
      "ENV_MISSING",
    );
  }

  const client = createClient({ url: uri });
  await client.connect();
  cachedRedisClient = client;
  globalThis.__redisClient = cachedRedisClient;
  return cachedRedisClient;
}
