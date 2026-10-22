import type { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

export class RateLimitExceeded extends Error {
  constructor() {
    super("Rate limit exceeded");
    this.name = "RateLimitExceeded";
  }
}

function bucketKey(namespace: string, value: string) {
  const digest = createHash("sha256").update(value).digest("hex").slice(0, 48);
  return `${namespace}:${digest}`;
}

export async function consumeRateLimit(prisma: PrismaClient, namespace: string, value: string, limit: number, windowMs: number) {
  const key = bucketKey(namespace, value);
  const now = new Date();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const bucket = await tx.rateLimitBucket.findUnique({ where: { key } });
        const withinWindow = bucket && now.getTime() - bucket.windowStart.getTime() < windowMs;
        if (withinWindow && bucket.count >= limit) throw new RateLimitExceeded();

        if (withinWindow) {
          await tx.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } });
        } else {
          await tx.rateLimitBucket.upsert({ where: { key }, update: { windowStart: now, count: 1 }, create: { key, windowStart: now, count: 1 } });
        }
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error) {
      if (error instanceof RateLimitExceeded || attempt === 1) throw error;
    }
  }
}

export async function resetRateLimit(prisma: PrismaClient, namespace: string, value: string) {
  const key = bucketKey(namespace, value);
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}
