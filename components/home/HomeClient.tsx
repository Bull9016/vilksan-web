"use client";

import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "@/components/ui/EditableImage";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import HeroCarousel from "./HeroCarousel";
import CategoryShowcase from "./CategoryShowcase";
import FeaturedGrid from "./FeaturedGrid";
import type { Blog } from "@/app/actions/blog";
import type { Product, Collection } from "@/app/actions/product";
import type { GridItem } from "@/app/actions/content";
import type { Category } from "@/app/actions/category";

interface ContentMap {
    [key: string]: { value: string; style?: any };
}

export default function HomeClient({
    content,
    newArrivals,
    collections,
    categoryShowcase,
    gridItems,
}: {
    content: ContentMap;
    latestBlog: Blog | null;
    newArrivals: Product[];
    collections: Collection[];
    categoryShowcase?: ((Collection | Category) & { products: Product[] })[];
    gridItems?: GridItem[];
    blogs?: Blog[];
}) {
    return (
        <main className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-foreground overflow-x-hidden relative">

            {/* Hero Section - Carousel */}
            <div className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <HeroCarousel content={content} />
            </div>

            {/* Category Showcase (New Feature) */}
            {categoryShowcase && categoryShowcase.length > 0 && (
                <CategoryShowcase categories={categoryShowcase} />
            )}

            {/* Section 2: New Arrivals */}
            {newArrivals.length > 0 && (
                <section className="py-24 bg-white dark:bg-black border-b border-neutral-100 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-end justify-between mb-12">
                            <h2 className="text-4xl font-display font-bold">New Arrivals</h2>
                            <Link href="/products?sort=newest" className="text-sm font-bold uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-50 transition-opacity">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {newArrivals.map(product => (
                                <Link key={product.id} href={`/products/${product.slug || product.id}`} className="group cursor-pointer">
                                    <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden mb-4">
                                        {(product.cover_image || (product.media && product.media[0])) && (
                                            <img src={product.cover_image || product.media[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] uppercase font-bold px-2 py-1">
                                                Sold Out
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                                    <p className="text-neutral-500 font-mono text-sm">₹{product.price.toLocaleString('en-IN')}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Section 3: Categories / Collections */}
            {collections.length > 0 && (
                <section className="py-24 bg-neutral-50 dark:bg-black">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-4">
                            Spring is Around the Corner
                        </h2>
                        <div className="flex justify-center gap-8 text-xs md:text-sm font-bold uppercase tracking-widest text-neutral-500">
                            {collections.slice(0, 4).map(collection => (
                                <Link key={collection.id} href={`/collections/${collection.slug}`} className="hover:text-black dark:hover:text-white transition-colors">
                                    {collection.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {collections.slice(0, 3).map((collection, idx) => (
                            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block text-center">
                                <div className="aspect-[3/4] relative overflow-hidden bg-white mb-6">
                                    {collection.image ? (
                                        <img src={collection.image} alt={collection.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300 font-bold text-4xl uppercase">
                                            {collection.title[0]}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-sm uppercase tracking-widest mb-2">{collection.title}</h3>
                                <span className="text-xs text-neutral-500 uppercase border-b border-transparent group-hover:border-neutral-500 transition-colors">Shop Now</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Grid Section (Custom 4-block layout) */}
            {gridItems && <FeaturedGrid items={gridItems} />}

            {/* Product Teaser Section */}
            <section className="py-24 px-6 md:px-12 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <EditableText
                            contentKey="home_collection_title"
                            initialValue={content["home_collection_title"]?.value || "THE ESSENTIALS"}
                            initialStyle={content["home_collection_title"]?.style}
                            as="h2"
                            className="font-display text-4xl mb-8 font-bold"
                        />
                        <EditableText
                            contentKey="home_collection_desc"
                            initialValue={content["home_collection_desc"]?.value || "Discover our latest arrivals. Designed with precision, crafted for longevity. Every piece tells a story of authentic design."}
                            initialStyle={content["home_collection_desc"]?.style}
                            as="p"
                            className="text-neutral-500 leading-relaxed mb-8"
                        />
                        <Link
                            href={content["home_collection_cta_link"]?.value || "/collections"}
                            className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 uppercase tracking-widest text-sm hover:opacity-80 transition-opacity inline-block"
                        >
                            Shop Now
                        </Link>
                    </div>
                    <div className="aspect-[3/4] relative">
                        <EditableImage
                            contentKey="home_collection_image"
                            src={content["home_collection_image"]?.value || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"}
                            initialStyle={content["home_collection_image"]?.style}
                            alt="Collection Item"
                            className="object-cover"
                            containerClassName="w-full h-full"
                        />
                    </div>
                </div>
            </section>

            <section className="py-0 border-t border-neutral-100 dark:border-neutral-800">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-square relative">
                        <EditableImage
                            contentKey="home_editorial_image"
                            src={content["home_editorial_image"]?.value || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"}
                            initialStyle={content["home_editorial_image"]?.style}
                            alt="Editorial"
                            className="object-cover"
                            containerClassName="w-full h-full"
                        />
                    </div>
                    <div className="flex flex-col justify-center p-12 md:p-24 bg-neutral-50 dark:bg-neutral-900/30">
                        <EditableText
                            contentKey="home_editorial_title"
                            initialValue={content["home_editorial_title"]?.value || "THE MISSION"}
                            initialStyle={content["home_editorial_title"]?.style}
                            as="h2"
                            className="font-display text-4xl mb-6 font-bold"
                        />
                        <EditableText
                            contentKey="home_editorial_text"
                            initialValue={content["home_editorial_text"]?.value || "To redefine luxury through the lens of streetwear. Bridging the gap between comfort and high fashion, one silhouette at a time."}
                            initialStyle={content["home_editorial_text"]?.style}
                            as="p"
                            className="text-neutral-500 leading-relaxed mb-8"
                        />
                        <Link href="/blog" className="self-start px-8 py-3 border border-black dark:border-white text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                            View Journal
                        </Link>
                    </div>
                </div>
            </section>


        </main>
    );
}
