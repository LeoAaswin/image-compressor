import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
