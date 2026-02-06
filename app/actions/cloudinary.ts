"use server";

import { v2 as cloudinary } from "cloudinary";

export async function uploadImage(formData: FormData): Promise<{ secure_url?: string; error?: string }> {
    // Re-configure to ensure fresh env vars if server didn't restart fully
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // DEBUG LOGS (Temporary) 
    // Console logs appear in your terminal where `npm run dev` is running


    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "vilksan-uploads";

    if (!file) {
        return { error: "No file provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    resolve({ error: error.message });
                    return;
                }
                if (result) {
                    resolve({ secure_url: result.secure_url });
                } else {
                    resolve({ error: "Upload failed: No result from Cloudinary" });
                }
            }
        ).end(buffer);
    });
}
