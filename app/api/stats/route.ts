import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const STATS_KEY = "opti-pix:stats";

// Hardcoded fallback stats if db is empty or disconnected
const FALLBACK_STATS = {
  totalFiles: 12450,
  totalSizeBytes: 45 * 1024 * 1024 * 1024,
};

export async function GET() {
  try {
    const stats: any = await redis.hgetall(STATS_KEY);
    
    // If stats don't exist yet, return the fallbacks
    if (!stats || Object.keys(stats).length === 0) {
      return NextResponse.json(FALLBACK_STATS);
    }
    
    return NextResponse.json({
      totalFiles: Number(stats.totalFiles) || FALLBACK_STATS.totalFiles,
      totalSizeBytes: Number(stats.totalSizeBytes) || FALLBACK_STATS.totalSizeBytes,
    });
  } catch (error) {
    console.error("Failed to fetch stats from Redis", error);
    return NextResponse.json(FALLBACK_STATS, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filesCount = Number(body.filesCount) || 1;
    const bytesCount = Number(body.bytesCount) || 0;
    
    // First ensure the keys exist with the fallback values if they are empty
    // We use a small transaction or just setnx for fallback data
    const existing = await redis.hgetall(STATS_KEY);
    if (!existing || Object.keys(existing).length === 0) {
      await redis.hset(STATS_KEY, {
        totalFiles: FALLBACK_STATS.totalFiles,
        totalSizeBytes: FALLBACK_STATS.totalSizeBytes
      });
    }

    // Increment values
    await redis.hincrby(STATS_KEY, "totalFiles", filesCount);
    await redis.hincrby(STATS_KEY, "totalSizeBytes", bytesCount);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment stats in Redis", error);
    return NextResponse.json({ error: "Failed to increment stats" }, { status: 500 });
  }
}
