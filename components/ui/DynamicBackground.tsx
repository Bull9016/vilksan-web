"use client";

import { EditableText } from "./EditableText";
import { EditableImage } from "./EditableImage";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface DynamicBackgroundProps {
    bgText: string;
    productImage: string;
}

export function DynamicBackground({ bgText, productImage }: DynamicBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const yImage = useTransform(scrollYProgress, [0, 1], [0, 50]);

    return (
        <div ref={containerRef} className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-premium-light dark:bg-premium-dark">
            {/* Background Text - Dynamic & Editable */}
            <motion.div
                style={{ y: yText }}
                className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none opacity-10"
            >
                <EditableText
                    initialValue={bgText}
                    as="h1"
                    className="text-[15vw] font-bold uppercase whitespace-nowrap text-premium-black dark:text-white"
                />
            </motion.div>

            {/* Product Image - Centered */}
            <motion.div
                style={{ y: yImage }}
                className="relative z-10 w-full max-w-md md:max-w-xl aspect-[3/4]"
            >
                <EditableImage
                    src={productImage}
                    alt="Product"
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </motion.div>
        </div>
    );
}
