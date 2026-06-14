import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = 'edge';

const RATE_LIMIT = 20;
const WINDOW_SECONDS = 3600; // 1 hour

function getClientIp(req: NextRequest): string {
    // Cloudflare sets CF-Connecting-IP; fall back to x-forwarded-for
    return (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "unknown"
    );
}

export async function POST(req: NextRequest) {
    // Rate limiting
    const ip = getClientIp(req);
    const rateLimitKey = `rate:remove-bg:${ip}`;

    try {
        const count = await redis.incr(rateLimitKey);
        if (count === 1) {
            // First request in this window — set the TTL
            await redis.expire(rateLimitKey, WINDOW_SECONDS);
        }
        if (count > RATE_LIMIT) {
            const ttl = await redis.ttl(rateLimitKey);
            return NextResponse.json(
                { error: `Rate limit exceeded. You can remove backgrounds ${RATE_LIMIT} times per hour. Try again in ${Math.ceil(ttl / 60)} minute(s).` },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(RATE_LIMIT),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + ttl),
                        "Retry-After": String(ttl),
                    },
                }
            );
        }
    } catch {
        // If Redis is down, fail open — don't block the user
    }

    try {
        const formData = await req.formData();
        const imageFile = formData.get("image_file");

        if (!imageFile) {
            return NextResponse.json(
                { error: "No image file provided" },
                { status: 400 }
            );
        }

        const apiKey = process.env.REMOVE_BG_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        // Forward the request to Remove.bg
        const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                "X-Api-Key": apiKey,
            },
            body: formData, // FormData automatically sets the Content-Type header with boundary
        });

        if (!removeBgResponse.ok) {
            const errorText = await removeBgResponse.text();
            console.error("Remove.bg API Error:", errorText);
            return NextResponse.json(
                { error: `Remove.bg API failed: ${removeBgResponse.statusText}` },
                { status: removeBgResponse.status }
            );
        }

        // Get the image blob
        const imageBlob = await removeBgResponse.blob();

        // Return the image with the correct content type
        return new NextResponse(imageBlob, {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": 'attachment; filename="no-bg.png"',
            },
        });

    } catch (error) {
        console.error("Error processing remove-bg request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

