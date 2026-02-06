"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---

export type DailyStats = {
    date: string;
    revenue: number;
    orders: number;
};

export type AdvancedStats = {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    averageOrderValue: number;
    products: number;
    blogs: number;
    chartData: DailyStats[];
};

// --- HELPERS ---

function getMonthRange(date: Date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

function getPreviousMonthRange(date: Date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const end = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
}

function calculateGrowth(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// --- ACTIONS ---

export async function getAdvancedStats(): Promise<AdvancedStats> {
    const now = new Date();
    const { start: thisMonthStart, end: thisMonthEnd } = getMonthRange(now);
    const { start: lastMonthStart, end: lastMonthEnd } = getPreviousMonthRange(now);

    // Parallel Fetching
    const [products, blogs, thisMonthOrders, lastMonthOrders, allTimeOrders] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount, created_at")
            .gte("created_at", thisMonthStart.toISOString())
            .lte("created_at", thisMonthEnd.toISOString()),
        supabase.from("orders").select("total_amount")
            .gte("created_at", lastMonthStart.toISOString())
            .lte("created_at", lastMonthEnd.toISOString()),
        supabase.from("orders").select("total_amount") // For total lifetime revenue if needed, or just remove if not
    ]);

    // Calculate Totals
    const currentRevenue = thisMonthOrders.data?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;
    const lastRevenue = lastMonthOrders.data?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

    const currentOrders = thisMonthOrders.data?.length || 0;
    const lastOrders = lastMonthOrders.data?.length || 0;

    // Calculate Growth
    const revenueGrowth = calculateGrowth(currentRevenue, lastRevenue);
    const ordersGrowth = calculateGrowth(currentOrders, lastOrders);
    const averageOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;

    // Generate Chart Data (Daily for this month)
    const chartData: DailyStats[] = [];
    const daysInMonth = thisMonthEnd.getDate();

    // Initialize map with 0
    const dayMap = new Map<number, { revenue: number, orders: number }>();
    for (let i = 1; i <= daysInMonth; i++) {
        dayMap.set(i, { revenue: 0, orders: 0 });
    }

    // Fill with actual data
    thisMonthOrders.data?.forEach(order => {
        const day = new Date(order.created_at).getDate();
        const current = dayMap.get(day) || { revenue: 0, orders: 0 };
        dayMap.set(day, {
            revenue: current.revenue + (order.total_amount || 0),
            orders: current.orders + 1
        });
    });

    // Convert to array
    for (let i = 1; i <= daysInMonth; i++) {
        chartData.push({
            date: `${i}`,
            ...dayMap.get(i)!
        });
    }

    return {
        revenue: currentRevenue,
        revenueGrowth,
        orders: currentOrders,
        ordersGrowth,
        averageOrderValue,
        products: products.count || 0,
        blogs: blogs.count || 0,
        chartData
    };
}

export async function getStatements(startDate: Date, endDate: Date) {
    const { data, error } = await supabase
        .from("orders")
        .select(`
            id,
            total_amount,
            status,
            created_at,
            items
        `)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}
