"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Item = {
    title: string;
    content: string;
};

export default function ProductAccordions({ items }: { items: Item[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-0 border-t border-neutral-100 dark:border-neutral-800">
            {items.map((item, idx) => (
                <div key={idx} className="border-b border-neutral-100 dark:border-neutral-800">
                    <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full py-4 flex items-center justify-between text-left group"
                    >
                        <span className="text-sm font-bold uppercase tracking-widest group-hover:opacity-60 transition-opacity">
                            {item.title}
                        </span>
                        {openIndex === idx ? <Minus size={14} /> : <Plus size={14} />}
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === idx && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pb-6 text-neutral-500 leading-relaxed text-sm">
                                    {item.content}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
