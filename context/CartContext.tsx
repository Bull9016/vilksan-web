"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type CartItem = {
    productId: string;
    variantId?: string;
    title: string;
    price: number;
    image?: string;
    size?: string;
    color?: string;
    quantity: number;
    maxStock: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    toggleCart: () => void;
    cartCount: number;
    subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useRouter, usePathname } from "next/navigation";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize Supabase and User
    useEffect(() => {
        const init = async () => {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();

            // Check initial user
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event: string, session: any) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (event === 'SIGNED_OUT') {
                    setItems([]); // Clear local cart on logout
                    localStorage.removeItem("vilksan_cart");
                } else if (event === 'SIGNED_IN' && currentUser) {
                    // Fetch remote cart
                    loadRemoteCart(currentUser.id, supabase);
                }
            });
        };
        init();
    }, []);

    const loadRemoteCart = async (userId: string, supabase: any) => {
        try {
            // Get user's cart
            let { data: cart } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (cart) {
                // Get items
                const { data: cartItems } = await supabase
                    .from('cart_items')
                    .select('*, products(title, price, media, stock)')
                    .eq('cart_id', cart.id);

                if (cartItems) {
                    const mappedItems: CartItem[] = cartItems.map((item: any) => ({
                        productId: item.product_id,
                        variantId: item.variant_id || undefined,
                        title: item.products.title,
                        price: item.products.price,
                        image: item.products.media?.[0],
                        quantity: item.quantity,
                        maxStock: item.products.stock
                    }));
                    setItems(mappedItems);
                }
            }
        } catch (error) {
            console.error("Error loading remote cart:", error);
        }
    };

    // Load from local storage on mount (only if no user initially)
    useEffect(() => {
        if (!user) {
            const savedCart = localStorage.getItem("vilksan_cart");
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
        }
        setIsLoaded(true);
    }, [user]);

    // Save to local storage OR Supabase on change
    useEffect(() => {
        if (!isLoaded) return;

        const syncCart = async () => {
            if (user) {
                // DB Sync Logic (Debounced in a real app, simplified here)
                try {
                    const { createClient } = await import("@/utils/supabase/client");
                    const supabase = createClient();

                    // 1. Get or Create Cart
                    let { data: cart } = await supabase
                        .from('carts')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();

                    if (!cart) {
                        const { data: newCart } = await supabase
                            .from('carts')
                            .insert({ user_id: user.id })
                            .select()
                            .single();
                        cart = newCart;
                    }

                    if (cart) {
                        // 2. Clear existing items (Simplest sync strategy: Replace all)
                        // Note: For production, a diffing strategy is better to avoid RLS spam
                        await supabase
                            .from('cart_items')
                            .delete()
                            .eq('cart_id', cart.id);

                        // 3. Insert current items
                        if (items.length > 0) {
                            const itemsToInsert = items.map(item => ({
                                cart_id: cart.id,
                                product_id: item.productId,
                                variant_id: item.variantId || null,
                                quantity: item.quantity
                            }));
                            await supabase.from('cart_items').insert(itemsToInsert);
                        }
                    }

                } catch (error) {
                    console.error("Failed to sync cart to DB", error);
                }
            } else {
                localStorage.setItem("vilksan_cart", JSON.stringify(items));
            }
        };

        const timeoutId = setTimeout(() => {
            syncCart();
        }, 1000); // 1s debounce

        return () => clearTimeout(timeoutId);

    }, [items, isLoaded, user]);

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        if (!user) {
            toast.error("Please log in to add items to cart");
            router.push(`/login?next=${pathname}`);
            return;
        }

        setItems((currentItems) => {
            const normalizedVariantId = newItem.variantId || undefined;

            const existingItemIndex = currentItems.findIndex(
                (item) => item.productId === newItem.productId && (item.variantId || undefined) === normalizedVariantId
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...currentItems];
                const existingItem = updatedItems[existingItemIndex];

                if (existingItem.quantity >= existingItem.maxStock) {
                    toast.error("Max stock reached");
                    return currentItems;
                }

                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + 1,
                };
                toast.success("Added to cart");
                return updatedItems;
            } else {
                toast.success("Added to cart");
                setIsOpen(true);
                return [...currentItems, { ...newItem, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId: string, variantId?: string) => {
        setItems((currentItems) =>
            currentItems.filter((item) => !(item.productId === productId && item.variantId === variantId))
        );
        toast.success("Item removed");
    };

    const updateQuantity = (productId: string, variantId: string | undefined, delta: number) => {
        setItems((currentItems) => {
            return currentItems.map((item) => {
                if (item.productId === productId && item.variantId === variantId) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity <= 0) return item;
                    if (newQuantity > item.maxStock) {
                        toast.error("Max stock reached");
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("vilksan_cart");
    };

    const toggleCart = () => setIsOpen((prev) => !prev);
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isOpen,
                toggleCart,
                cartCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
