"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { type OrderItem } from "@/app/actions/order";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
    const { items, isOpen, toggleCart, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
    const router = useRouter(); // Added router
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) return null;

    const handleCheckout = () => {
        router.push("/checkout");
        toggleCart();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-black border-l border-neutral-200 dark:border-neutral-800 z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <h2 className="font-display text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Cart ({items.length})
                            </h2>
                            <button onClick={toggleCart} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
                                    <ShoppingBag className="w-16 h-16 opacity-20" />
                                    <p>Your cart is empty</p>
                                    <button
                                        onClick={toggleCart}
                                        className="text-black dark:text-white font-bold underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={`${item.productId}-${item.variantId}-${idx}`} className="flex gap-4">
                                        <div className="relative w-20 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-md overflow-hidden flex-shrink-0">
                                            {item.image && (
                                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold line-clamp-2 leading-tight">{item.title}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId, item.variantId)}
                                                        className="text-neutral-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.size && item.color && <span className="mx-2">•</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.variantId, -1)}
                                                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm w-4 text-center font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.variantId, 1)}
                                                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md disabled:opacity-50"
                                                        disabled={item.quantity >= item.maxStock}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <p className="font-mono font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Subtotal</span>
                                    <span className="text-2xl font-bold font-display">{formatCurrency(subtotal)}</span>
                                </div>
                                <p className="text-xs text-neutral-400 text-center">Shipping & taxes calculated at checkout</p>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-black text-white dark:bg-white dark:text-black py-4 font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {isCheckingOut ? <Loader2 className="animate-spin" /> : "Checkout"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
