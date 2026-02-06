"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

export default function ProductFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");
    const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
    const [trending, setTrending] = useState(searchParams.get("trending") === "true");
    const [size, setSize] = useState(searchParams.get("size") || "");

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Debounce params update
    useEffect(() => {
        const timer = setTimeout(() => {
            updateParams({
                minPrice,
                maxPrice,
                sort,
                featured: featured ? "true" : "",
                trending: trending ? "true" : "",
                size
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [minPrice, maxPrice, sort, featured, trending, size]);

    const updateParams = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.keys(updates).forEach(key => {
            if (updates[key]) {
                params.set(key, updates[key]);
            } else {
                params.delete(key);
            }
        });

        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-6 py-3 rounded-full shadow-xl font-bold uppercase tracking-widest text-xs"
            >
                Filters
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed inset-0 z-50 bg-white dark:bg-black p-6 md:p-0 md:static md:bg-transparent md:block md:w-64 flex-shrink-0 transition-transform duration-300
                ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="flex justify-between items-center md:hidden mb-8">
                    <h2 className="text-xl font-bold font-display">Filters</h2>
                    <button onClick={() => setMobileOpen(false)}><X /></button>
                </div>

                <div className="space-y-12">
                    {/* Collections / Categories */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Collections</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center transition-colors ${featured ? "bg-black border-black dark:bg-white dark:border-white" : "group-hover:border-black dark:group-hover:border-white"}`}>
                                    {featured && <div className="w-2 h-2 bg-white dark:bg-black" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={featured}
                                    onChange={(e) => setFeatured(e.target.checked)}
                                    className="hidden"
                                />
                                <span className={`text-sm ${featured ? "font-bold" : "text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white"}`}>
                                    Featured Collection
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center transition-colors ${trending ? "bg-black border-black dark:bg-white dark:border-white" : "group-hover:border-black dark:group-hover:border-white"}`}>
                                    {trending && <div className="w-2 h-2 bg-white dark:bg-black" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={trending}
                                    onChange={(e) => setTrending(e.target.checked)}
                                    className="hidden"
                                />
                                <span className={`text-sm ${trending ? "font-bold" : "text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white"}`}>
                                    Trending Now
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Sort By</h3>
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 py-2 font-mono text-sm"
                            >
                                <span>
                                    {sort === "newest" && "Newest Arrivals"}
                                    {sort === "price_asc" && "Price: Low to High"}
                                    {sort === "price_desc" && "Price: High to Low"}
                                </span>
                                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isOpen && (
                                <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-xl mt-1 py-1">
                                    {[
                                        { value: "newest", label: "Newest Arrivals" },
                                        { value: "price_asc", label: "Price: Low to High" },
                                        { value: "price_desc", label: "Price: High to Low" }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSort(option.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${sort === option.value ? "font-bold" : ""}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Price Range</h3>
                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-neutral-900 px-3 py-2 text-sm rounded-sm outline-none"
                            />
                            <span className="text-neutral-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-neutral-900 px-3 py-2 text-sm rounded-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Hardcoded Sizes for MVP */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {["XS", "S", "M", "L", "XL"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSize(size === s ? "" : s)}
                                    className={`w-10 h-10 border flex items-center justify-center text-xs transition-colors ${size === s
                                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {
                mobileOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
                )
            }
        </>
    );
}
