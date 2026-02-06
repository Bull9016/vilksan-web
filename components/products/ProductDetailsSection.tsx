"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductAccordions from "./ProductAccordions";

interface ProductDetailsSectionProps {
    items: {
        title: string;
        content: string;
    }[];
}

export default function ProductDetailsSection({ items }: ProductDetailsSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 group uppercase font-bold tracking-widest text-sm hover:opacity-70 transition-opacity"
            >
                <span className={`w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
                    <Play size={10} fill="currentColor" className="ml-0.5" />
                </span>
                <span>Details</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-8 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                            <ProductAccordions items={items} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
