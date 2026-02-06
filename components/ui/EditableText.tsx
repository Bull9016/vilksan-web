"use client";

import { saveContent } from "@/app/actions/content";
import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditableTextProps {
    initialValue: string;
    initialStyle?: any;
    className?: string;
    as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
    onSave?: (newValue: string) => void;
    contentKey?: string;
}

export function EditableText({
    initialValue,
    initialStyle = {},
    className,
    as: Component = "p",
    onSave,
    contentKey,
}: EditableTextProps) {
    const { isEditing } = useAdmin();
    const [value, setValue] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);

    // Styling for the component based on tag
    const baseStyles = "transition-all duration-200 block"; // Added block for transforms to work better
    const editStyles = isEditing
        ? "cursor-text border-b border-dashed border-gray-400 hover:border-gray-600 focus:outline-none focus:border-solid focus:border-black dark:focus:border-white"
        : "";

    // Construct dynamic style object
    const dynamicStyle: React.CSSProperties = {
        fontSize: initialStyle?.fontSize ? `${initialStyle.fontSize}px` : undefined,
        color: initialStyle?.color,
        transform: `rotate(${initialStyle?.tilt || 0}deg) translate(${initialStyle?.x || 0}px, ${initialStyle?.y || 0}px)`,
        position: (initialStyle?.x || initialStyle?.y) ? 'relative' : undefined, // Ensure transforms work relative to flow or absolute if needed. actually translate works without position relative usually but let's be safe.
        // If the user sets position absolute manually via a class, this might conflict, but for now we assume relative tweaks.
    };

    if (isEditing) {
        return (
            <Component
                contentEditable
                suppressContentEditableWarning
                style={dynamicStyle}
                className={cn(baseStyles, editStyles, className)}
                onBlur={async (e: React.FocusEvent<HTMLElement>) => {
                    const newValue = e.target.innerText;
                    if (newValue !== value) {
                        setValue(newValue);
                        onSave?.(newValue);

                        if (contentKey) {
                            try {
                                await saveContent(contentKey, newValue, "text", initialStyle); // Pass existing style back to prevent overwriting with empty
                                toast.success("Saved");
                            } catch (err) {
                                console.error(err);
                                toast.error("Failed to save");
                            }
                        }
                    }
                    setIsFocused(false);
                }}
                onFocus={() => setIsFocused(true)}
            >
                {value}
            </Component>
        );
    }

    return <Component style={dynamicStyle} className={cn(baseStyles, className)}>{value}</Component>;
}
