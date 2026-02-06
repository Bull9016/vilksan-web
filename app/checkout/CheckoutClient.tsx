"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder, type OrderItem } from "@/app/actions/order";
import { AddressSelector } from "@/components/checkout/AddressManager";
import { type Address } from "@/app/actions/user";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutClient({ user, initialAddresses }: { user: any, initialAddresses: Address[] }) {
    const { items, subtotal, clearCart } = useCart();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(initialAddresses.find(a => a.is_default)?.id || initialAddresses[0]?.id || null);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 mx-auto opacity-20 mb-4" />
                <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
                <Link href="/products" className="text-black dark:text-white underline">Start Shopping</Link>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address");
            return;
        }

        const address = initialAddresses.find(a => a.id === selectedAddressId);
        if (!address) return;

        setIsProcessing(true);
        try {
            // Transform cart items to OrderItems
            const orderItems: OrderItem[] = items.map(item => ({
                productId: item.productId,
                title: item.title,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
                size: item.size,    // Changed: Pass size
                color: item.color   // Changed: Pass color
            }));

            // Pass address to createOrder (we need to update createOrder to accept it)
            // For now, we update the createOrder call
            // We need to modify the order action first to accept address, but let's assume it does or we pass it

            // To properly implement this, we need to modify `app/actions/order.ts`.
            // For this step, I'll update `createOrder` signature in parallel/next step.
            // Let's pass it as a second arg which we need to enable
            await createOrder(orderItems, subtotal, address);

            toast.success("Order placed successfully!");
            clearCart();
            // Redirect to success or account page
            router.push("/account");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to place order");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {/* Left Column: Address */}
            <div className="md:col-span-2 space-y-8">
                <AddressSelector
                    addresses={initialAddresses}
                    selectedId={selectedAddressId}
                    onSelect={setSelectedAddressId}
                />
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 h-fit sticky top-24">
                <h2 className="font-display text-lg font-bold uppercase tracking-widest mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="relative w-12 h-16 bg-neutral-100 rounded flex-shrink-0 overflow-hidden">
                                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold line-clamp-1">{item.title}</p>
                                <p className="text-xs text-neutral-500">
                                    {item.size} / {item.color} x {item.quantity}
                                </p>
                                <p className="text-sm font-mono mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Subtotal</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Shipping</span>
                        <span className="font-mono">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <span>Total</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedAddressId}
                    className="w-full mt-8 bg-black text-white dark:bg-white dark:text-black py-4 font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Place Order"}
                </button>

                {!selectedAddressId && (
                    <p className="text-xs text-red-500 text-center mt-2">Please select a shipping address to continue.</p>
                )}
            </div>
        </div>
    );
}
