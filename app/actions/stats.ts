"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getDashboardStats() {
    const [products, blogs, orders] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"), // We'll sum this up
    ]);

    const totalRevenue = orders.data?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

    return {
        productCount: products.count || 0,
        blogCount: blogs.count || 0,
        orderCount: orders.data?.length || 0,
        revenue: totalRevenue
    };
}
