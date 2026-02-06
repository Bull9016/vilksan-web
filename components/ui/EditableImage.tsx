"use client";

import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import Image from "next/image";

interface EditableImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    containerClassName?: string;
    priority?: boolean;
    onUpload?: (newSrc: string) => void;
    initialStyle?: any;
    contentKey?: string;
    readOnly?: boolean;
}

export function EditableImage({
    src,
    alt,
    width = 800,
    height = 600,
    className,
    containerClassName,
    priority = false,
    onUpload,
    initialStyle = {},
    contentKey,
    readOnly = false,
}: EditableImageProps) {
    const { isEditing } = useAdmin();

    const handleUploadClick = () => {
        if (!isEditing || readOnly) return;
        // Placeholder for Cloudinary Widget
        alert("Cloudinary Upload Widget would open here.");
    };

    // Construct dynamic style object
    const dynamicStyle: React.CSSProperties = {
        width: initialStyle?.width ? `${initialStyle.width}%` : undefined, // Assuming width is % for images mainly
        transform: `rotate(${initialStyle?.tilt || 0}deg) translate(${initialStyle?.x || 0}px, ${initialStyle?.y || 0}px)`,
        position: (initialStyle?.x || initialStyle?.y) ? 'relative' : undefined,
    };

    return (
        <div style={dynamicStyle} className={cn("relative group overflow-hidden", containerClassName)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn("object-cover w-full h-full transition-transform duration-500", className)}
                priority={priority}
            />

            {isEditing && !readOnly && (
                <div
                    onClick={handleUploadClick}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                    <div className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 font-medium">
                        <Upload size={18} />
                        Change Image
                    </div>
                </div>
            )}
        </div>
    );
}
