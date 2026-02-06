"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GridItem } from "@/app/actions/content";

export default function FeaturedGrid({ items }: { items: GridItem[] }) {
    if (!items || items.length === 0) return null;

    // Separate items by position
    const largeItem = items.find(i => i.position === 1);
    const smallItems = items.filter(i => i.position > 1).sort((a, b) => a.position - b.position);

    return (
        <section className="container mx-auto px-4 py-20">
            <div className="space-y-8">

                {/* 1. Large Top Block */}
                {largeItem && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-neutral-50 dark:bg-neutral-900/50 p-8 md:p-12">
                        {/* Image Left/Right? Based on design it seems image left or right. Let's do Image Left based on generic layout, or Image Right based on provided screenshot. Steps say "Exactly like image". Image shows shoe on left, text on right. */}
                        <div className="relative aspect-square md:aspect-[4/3] order-1 md:order-1 bg-neutral-100 dark:bg-neutral-800">
                            {largeItem.image_url ? (
                                <Image
                                    src={largeItem.image_url}
                                    alt={largeItem.title}
                                    fill
                                    className="object-contain p-8 mix-blend-multiply dark:mix-blend-normal"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
                            )}
                        </div>

                        <div className={cn("order-2 md:order-2 space-y-4", largeItem.text_color === 'white' ? "text-white" : "text-neutral-900 dark:text-white")}>
                            {largeItem.subtitle && (
                                <p className="uppercase tracking-widest text-sm text-neutral-500">{largeItem.subtitle}</p>
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-tighter">
                                {largeItem.title}
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                                {largeItem.description}
                            </p>
                            <Link
                                href={largeItem.link_url || "#"}
                                className="inline-block border-b border-black dark:border-white pb-1 font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                {largeItem.link_text}
                            </Link>
                        </div>
                    </div>
                )}

                {/* 2. Bottom Row (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {smallItems.map((item) => (
                        <div key={item.id} className="group cursor-pointer space-y-4">
                            <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
                                )}
                            </div>

                            <div className={cn(item.text_color === 'white' ? "text-white" : "text-neutral-900 dark:text-white")}>
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-neutral-500">{item.title}</h3>
                                <p className="text-xl font-display font-medium leading-tight mb-4">
                                    {item.description}
                                </p>
                                <Link
                                    href={item.link_url || "#"}
                                    className="inline-block border-b border-neutral-300 dark:border-neutral-700 pb-0.5 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors"
                                >
                                    {item.link_text}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
