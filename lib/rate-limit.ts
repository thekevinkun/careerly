import { prisma } from "@/lib/prisma";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = new Date();
  const resetTime = new Date(now.getTime() + windowMs);

  // Find existing rate limit record
  const existing = await prisma.rateLimit.findUnique({
    where: { identifier },
  });

  // If record exists but expired, delete it
  if (existing && now > existing.resetTime) {
    await prisma.rateLimit.delete({
      where: { identifier },
    });
  }

  // If no record exists (first attempt or after expiry), create one
  if (!existing || now > existing.resetTime) {
    await prisma.rateLimit.create({
      data: {
        identifier,
        count: 1,
        resetTime,
      },
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: resetTime.getTime(),
    };
  }

  // If limit exceeded, deny
  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime.getTime(),
    };
  }

  // Increment counter
  await prisma.rateLimit.update({
    where: { identifier },
    data: { count: { increment: 1 } },
  });

  return {
    success: true,
    remaining: limit - existing.count - 1,
    resetTime: existing.resetTime.getTime(),
  };
}

export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(resetTime).toISOString(),
  };
}
