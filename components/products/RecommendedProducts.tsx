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

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="flex-[0_0_80%] md:flex-[0_0_40%] lg:flex-[0_0_25%] min-w-0">
                                <Link href={`/products/${product.slug || product.id}`} className="group block">
                                    <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden mb-4">
                                        {product.media && product.media[0] && (
                                            <Image
                                                src={product.media[0]}
                                                alt={product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                                            />
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] uppercase font-bold px-2 py-1">
                                                Sold Out
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">{product.title}</h3>
                                    <p className="text-neutral-500 font-mono text-xs">${product.price.toFixed(2)}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
