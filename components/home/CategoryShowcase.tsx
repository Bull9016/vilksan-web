"use client";

import { formatCurrency } from "@/utils/format";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Collection } from "@/app/actions/product";
import type { Category } from "@/app/actions/category";
import { cn } from "@/lib/utils";

interface CategoryShowcaseProps {
    categories: ((Collection | Category) & { products: Product[] })[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (!categories || categories.length === 0) return null;

    const activeCategory = categories[activeTab];

    return (
        <section className="py-24 bg-neutral-50 dark:bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* 1. Header & Tabs */}
                <div className="flex flex-col items-center mb-16 space-y-8">
                    <h2 className="font-display font-bold text-3xl uppercase tracking-widest text-center">
                        Shop By Category
                    </h2>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-b border-neutral-200 dark:border-neutral-800 pb-4 relative">
                        {categories.map((cat, idx) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(idx)}
                                className={cn(
                                    "text-sm font-bold uppercase tracking-widest pb-4 relative transition-colors",
                                    activeTab === idx
                                        ? "text-black dark:text-white"
                                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                )}
                            >
                                {cat.title}
                                {activeTab === idx && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Product Carousel Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {activeCategory.products.length > 0 ? (
                                activeCategory.products.slice(0, 4).map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug || product.id}`}
                                        className="group block"
                                    >
                                        <div className="aspect-[3/4] relative bg-white dark:bg-neutral-900 overflow-hidden mb-4">
                                            {(product.cover_image || (product.media && product.media[0])) ? (
                                                <Image
                                                    src={product.cover_image || product.media[0]}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-300">
                                                    No Image
                                                </div>
                                            )}
                                            {/* Quick Add / Hover Overlay could go here */}
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-sm uppercase tracking-wide group-hover:underline underline-offset-4 decoration-1">{product.title}</h3>
                                                <p className="text-neutral-500 text-xs mt-1">{activeCategory.title}</p>
                                            </div>
                                            <span className="font-mono text-sm">{formatCurrency(product.price)}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full h-40 flex items-center justify-center text-neutral-400">
                                    No products found in this category.
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* View All Button */}
                    <div className="mt-12 text-center">
                        <Link
                            href={`/collections/${activeCategory.slug}`}
                            className="inline-block border border-black dark:border-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                        >
                            View All {activeCategory.title}
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
