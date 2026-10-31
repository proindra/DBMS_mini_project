import { createHash } from "node:crypto";
import { createClient, type RedisClientType } from "redis";

export const CACHE_TTL_SECONDS = {
  product: 5 * 60,
  catalogue: 5 * 60,
  categories: 30 * 60,
  semanticSearch: 2 * 60,
} as const;

type CacheNamespace = "catalogue" | "categories";
type RedisClient = RedisClientType;

type RedisGlobal = typeof globalThis & {
  redisCacheClient?: RedisClient;
  redisCacheConnection?: Promise<RedisClient | null>;
  redisCacheWarningLogged?: boolean;
};

const globalRedis = globalThis as RedisGlobal;

function logRedisUnavailable(error: unknown) {
  if (globalRedis.redisCacheWarningLogged) return;
  globalRedis.redisCacheWarningLogged = true;
  console.warn(
    "Redis cache is unavailable; continuing with PostgreSQL:",
    error,
  );
}

async function getRedisClient(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL;
  if (!url) {
    logRedisUnavailable(new Error("REDIS_URL is not configured."));
    return null;
  }

  if (globalRedis.redisCacheClient?.isReady) {
    return globalRedis.redisCacheClient;
  }
  if (globalRedis.redisCacheClient?.isOpen) {
    return null;
  }
  if (globalRedis.redisCacheConnection) {
    return globalRedis.redisCacheConnection;
  }

  const client =
    globalRedis.redisCacheClient ??
    createClient({
      url,
      socket: {
        connectTimeout: 1_000,
        reconnectStrategy: (retries) =>
          retries >= 2 ? new Error("Redis connection retries exhausted.") : 250,
      },
    });

  client.on("error", logRedisUnavailable);
  globalRedis.redisCacheClient = client;

  const connection = client
    .connect()
    .then(() => client)
    .catch((error: unknown) => {
      logRedisUnavailable(error);
      client.destroy();
      if (globalRedis.redisCacheClient === client) {
        globalRedis.redisCacheClient = undefined;
      }
      return null;
    })
    .finally(() => {
      globalRedis.redisCacheConnection = undefined;
    });

  globalRedis.redisCacheConnection = connection;
  return connection;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function getCachedValue<T>(
  namespace: CacheNamespace,
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const client = await getRedisClient();
  if (!client) return load();

  const versionKey = `app-cache:v1:version:${namespace}`;
  let version: string;
  let cacheKey: string;
  try {
    version = (await client.get(versionKey)) ?? "0";
    cacheKey = `app-cache:v1:${namespace}:${version}:${digest(key)}`;
    const cached = await client.get(cacheKey);
    if (cached !== null) {
      try {
        return JSON.parse(cached) as T;
      } catch (error) {
        logRedisUnavailable(error);
        await client.del(cacheKey);
      }
    }
  } catch (error) {
    logRedisUnavailable(error);
    return load();
  }

  const value = await load();
  try {
    await client.set(cacheKey, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    logRedisUnavailable(error);
  }
  return value;
}

export async function invalidateProductCatalogueCache() {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.incr("app-cache:v1:version:catalogue");
  } catch (error) {
    logRedisUnavailable(error);
  }
}
