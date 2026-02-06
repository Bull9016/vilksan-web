"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";
import Image from "next/image";
import type { Product } from "@/app/actions/product";

interface RecommendedProductsProps {
    products: Product[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
        loop: true
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    if (!products || products.length === 0) return null;

    return (
        <section className="py-24 border-t border-neutral-100 dark:border-neutral-800">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-display font-medium">You might also like</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={scrollPrev}
                            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-visible" ref={emblaRef}>
                    <div className="flex gap-4 md:gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_25%] min-w-0">
                                <Link href={`/products/${product.slug || product.id}`} className="group block">
                                    <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden mb-4 rounded-sm">
                                        {(product.cover_image || (product.media && product.media[0])) && (
                                            <Image
                                                src={product.cover_image || product.media[0]}
                                                alt={product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 40vw, 25vw"
                                            />
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white text-[10px] uppercase font-bold px-3 py-1.5 tracking-widest">
                                                Sold Out
                                            </div>
                                        )}
                                        {/* Mock discount badge for demo since we don't have discount field yet */}
                                        <div className="absolute top-3 right-3 bg-black/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-[10px] font-bold px-3 py-1.5 rounded-full">
                                            -20%
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{product.title}</h3>
                                            <p className="text-xs text-neutral-500">{product.collection_id || "Collection"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm font-bold">₹{(product.price * 0.8).toLocaleString('en-IN')}</p>
                                            <p className="font-mono text-xs text-neutral-400 line-through">₹{product.price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
