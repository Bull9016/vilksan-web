"use client";

import { formatCurrency } from "@/utils/format";

import { useState } from "react";
import { type Product, type ProductVariant } from "@/app/actions/product";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { createOrder, type OrderItem } from "@/app/actions/order";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductActions({ product, variants }: { product: Product, variants?: ProductVariant[] }) {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const { addToCart } = useCart();
    const router = useRouter();

    // Extract unique colors and sizes from variants
    const uniqueColors = Array.from(new Set(variants?.map(v => v.color).filter(Boolean))) as string[];
    const uniqueSizes = Array.from(new Set(variants?.map(v => v.size).filter(Boolean))) as string[];

    // If no variants, fallback to standard if not provided (mock for now if empty)
    const hasVariants = variants && variants.length > 0;

    // Find selected variant
    const selectedVariant = variants?.find(v => v.color === selectedColor && v.size === selectedSize);
    const outOfStock = hasVariants ? (selectedVariant ? selectedVariant.stock <= 0 : false) : product.stock <= 0;

    const handleAddToCart = () => {
        if (hasVariants && (!selectedColor || !selectedSize)) {
            toast.error("Please select a size and color");
            return;
        }

        const variant = variants?.find(v => v.size === selectedSize && v.color === selectedColor);

        addToCart({
            productId: product.id,
            variantId: variant?.id,
            title: product.title,
            price: product.price,
            image: product.media?.[0],
            size: selectedSize || undefined,
            color: selectedColor || undefined,
            maxStock: variant ? variant.stock : product.stock
        });
    };

    const handleBuyNow = async () => {
        if (hasVariants && (!selectedColor || !selectedSize)) {
            toast.error("Please select a size and color");
            return;
        }

        if (outOfStock) {
            toast.error("Product is out of stock");
            return;
        }

        setIsBuying(true);
        try {
            const item: OrderItem = {
                productId: product.id,
                variantId: selectedVariant?.id,
                quantity: 1,
                price: product.price,
                title: product.title,
                size: selectedSize || undefined,
                color: selectedColor || undefined
            };

            // Provide dummy address for "Buy Now" (should ideally redirect to checkout)
            const dummyAddress = {
                full_name: "Guest User",
                line1: "123 Main St",
                city: "New York",
                state: "NY",
                zip: "10001",
                country: "US",
                phone: "555-0123"
            };

            await createOrder([item], product.price, dummyAddress);
            toast.success("Order placed successfully!");
            // In a real app we'd redirect to success page
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to place order";

            if (message.includes("User must be logged in")) {
                toast.error("Please log in to place an order");
                router.push("/login?redirect=/products");
                return;
            }

            console.error(error);
            toast.error(message);
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="space-y-8">
            {hasVariants && (
                <div className="space-y-6">
                    {/* Colors */}
                    {uniqueColors.length > 0 && (
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3 block">
                                Color: <span className="text-black dark:text-white">{selectedColor}</span>
                            </span>
                            <div className="flex gap-3">
                                {uniqueColors.map(color => {
                                    const variant = variants?.find(v => v.color === color);
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? "border-black dark:border-white scale-110" : "border-transparent"}`}
                                        >
                                            <span
                                                className="w-full h-full rounded-full border border-neutral-200 shadow-sm"
                                                style={{ backgroundColor: variant?.color_code || "#000" }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {uniqueSizes.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    Size: <span className="text-black dark:text-white">{selectedSize}</span>
                                </span>
                                <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-2 text-neutral-400">
                                    Size Guide
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {uniqueSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[3rem] px-2 h-10 border text-sm flex items-center justify-center transition-all ${selectedSize === size ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={outOfStock || isAdding || isBuying}
                    className="flex-1 border-2 border-black dark:border-white text-black dark:text-white py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isAdding ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        "Add to Cart"
                    )}
                </button>
                <button
                    onClick={handleBuyNow}
                    disabled={outOfStock || isBuying || isAdding}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isBuying ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : outOfStock ? (
                        "Out of Stock"
                    ) : (
                        <>
                            <ShoppingBag size={18} /> Buy Now
                        </>
                    )}
                </button>
            </div>
            <p className="text-xs text-center text-neutral-400 uppercase tracking-widest">
                {product.shipping_info || `Free shipping on orders over ${formatCurrency(100)}`}
            </p>
        </div>
    );
}
