"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type OrderItem = {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    title: string;
    size?: string;
    color?: string;
};

export type Order = {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    items: OrderItem[];
};

// --- ACTIONS ---

// Update type definition if you haven't already
type AddressSnapshot = {
    full_name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
};

export async function createOrder(items: OrderItem[], totalAmount: number, shippingAddress: AddressSnapshot) {
    if (!items || items.length === 0) throw new Error("No items in order");

    // Get User to attach ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to place an order");

    // 1. Verify Stock & Deduct
    for (const item of items) {
        // If variant
        if (item.variantId) {
            const { data: variant, error: vError } = await supabase
                .from("product_variants")
                .select("stock")
                .eq("id", item.variantId)
                .single();

            if (vError || !variant) throw new Error(`Variant not found for ${item.title}`);
            if (variant.stock < item.quantity) throw new Error(`Insufficient stock for ${item.title} (${item.size}/${item.color})`);

            const { error: updateError } = await supabase
                .from("product_variants")
                .update({ stock: variant.stock - item.quantity })
                .eq("id", item.variantId);

            if (updateError) throw new Error(`Failed to update stock for ${item.title}`);
        }

        // Always update main product stock as well (aggregate)
        const { data: product, error: pError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();

        if (pError || !product) throw new Error(`Product not found: ${item.title}`);

        // If no variant, main stock check is critical. If variant exists, we still deduct main stock for aggregate tracking
        if (!item.variantId && product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.title}`);
        }

        const { error: pUpdateError } = await supabase
            .from("products")
            .update({ stock: product.stock - item.quantity })
            .eq("id", item.productId);

        if (pUpdateError) throw new Error(`Failed to update product stock for ${item.title}`);
    }

    // 2. Create Order
    const { data: order, error } = await supabase
        .from("orders")
        .insert([{
            user_id: user.id, // Attach user ID
            total_amount: totalAmount,
            status: "processing",
            items: items,
            shipping_address: shippingAddress // Store address snapshot
        }])
        .select()
        .single();

    if (error) {
        console.error("Order creation failed:", error);
        throw new Error(`Failed to create order record: ${error.message} - ${error.details || ''} - ${error.hint || ''}`);
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/account"); // Update account history
    return order;
}

export async function getProductStats(productId: string) {
    // We need to query orders that contain this productId in their items JSON
    // Supabase JSON filtering: items @> '[{"productId": "..."}]'

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("items");

        if (error) throw error;

        let totalSold = 0;
        let purchaseCount = 0;

        if (orders) {
            orders.forEach((order: any) => {
                const orderItems = order.items as OrderItem[];
                if (Array.isArray(orderItems)) {
                    const relevantItems = orderItems.filter((i: OrderItem) => i.productId === productId);
                    if (relevantItems.length > 0) {
                        purchaseCount++;
                        totalSold += relevantItems.reduce((sum, i) => sum + i.quantity, 0);
                    }
                }
            });
        }

        return {
            totalSold,
            purchaseCount
        };
    } catch (e) {
        console.error("Failed to get product stats:", e);
        return { totalSold: 0, purchaseCount: 0 };
    }
}
