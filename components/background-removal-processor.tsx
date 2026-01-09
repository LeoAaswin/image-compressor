"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/dropzone";
import { Download, Eraser, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { LoadingSpinner } from "./loading-spinner";

interface ProcessedImage {
    originalUrl: string;
    processedUrl: string | null;
    file: File;
    name: string;
    status: "pending" | "processing" | "completed" | "error";
    error?: string;
}

export function BackgroundRemovalProcessor() {
    const [image, setImage] = useState<ProcessedImage | null>(null);

    const handleDrop = async (files: File[]) => {
        if (files.length === 0) return;

        // Only handle the first file for now to keep it simple
        const file = files[0];
        const url = URL.createObjectURL(file);

        setImage({
            originalUrl: url,
            processedUrl: null,
            file: file,
            name: file.name,
            status: "pending",
        });
    };

    const removeBackground = async () => {
        if (!image) return;

        setImage((prev) => prev ? { ...prev, status: "processing" } : null);

        try {
            const formData = new FormData();
            formData.append("image_file", image.file);
            formData.append("size", "auto");

            const response = await fetch("/api/remove-bg", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to remove background: ${response.statusText}`);
            }

            const blob = await response.blob();
            const processedUrl = URL.createObjectURL(blob);

            setImage((prev) => prev ? {
                ...prev,
                processedUrl: processedUrl,
                status: "completed"
            } : null);

            toast.success("Background removed successfully!");

        } catch (error) {
            console.error("Error removing background:", error);
            setImage((prev) => prev ? {
                ...prev,
                status: "error",
                error: "Failed to process image"
            } : null);
            toast.error("Failed to remove background. Please try again.");
        }
    };

    const handleDownload = () => {
        if (!image?.processedUrl) return;

        const link = document.createElement('a');
        link.href = image.processedUrl;

        // Construct new filename: original-name_no-bg.png
        const originalName = image.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const newFileName = `${nameWithoutExt}_no-bg.png`;

        link.download = newFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearImage = () => {
        if (image?.originalUrl) URL.revokeObjectURL(image.originalUrl);
        if (image?.processedUrl) URL.revokeObjectURL(image.processedUrl);
        setImage(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {/* Upload Area */}
                {!image ? (
                    <Dropzone onDrop={handleDrop} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Processing Image</h3>
                            <Button variant="ghost" size="sm" onClick={clearImage}>
                                <X className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Original Image */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Original</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center min-h-[300px] p-4 bg-muted/20 relative">
                                    <div className="relative w-full h-[300px]">
                                        <Image
                                            src={image.originalUrl}
                                            alt="Original"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Processed Result */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Result</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-4 bg-[url('/transparent-bg.png')] bg-repeat relative">
                                    {image.status === "processing" ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <LoadingSpinner />
                                            <p className="text-muted-foreground">Removing background...</p>
                                        </div>
                                    ) : image.status === "completed" && image.processedUrl ? (
                                        <div className="relative w-full h-[300px]">
                                            <Image
                                                src={image.processedUrl}
                                                alt="Processed"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : image.status === "error" ? (
                                        <div className="text-center text-destructive space-y-2">
                                            <p>Failed to process image.</p>
                                            <Button variant="outline" size="sm" onClick={removeBackground}>Try Again</Button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <p className="text-muted-foreground">Ready to process</p>
                                            <Button onClick={removeBackground} className="w-full">
                                                <Eraser className="w-4 h-4 mr-2" />
                                                Remove Background
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions */}
                        {image.status === "completed" && (
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setImage(null)}>Process Another</Button>
                                <Button onClick={handleDownload} className="w-full sm:w-auto">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PNG
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
