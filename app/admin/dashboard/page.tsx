"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/stats";
import { formatCurrency } from "@/utils/format";
import { DollarSign, ShoppingBag, Users, Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ revenue: 0, productCount: 0, blogCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDashboardStats();
                setStats({
                    revenue: data.revenue,
                    productCount: data.productCount,
                    blogCount: data.blogCount // Displaying blog count for now as Users substitute
                });
            } catch (e) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-display font-bold">Dashboard</h2>
                <p className="text-neutral-500">Overview of your store&apos;s performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-3xl font-display font-medium mt-1">{formatCurrency(stats.revenue)}</h3>
                </div>

                <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm uppercase tracking-widest">Products</p>
                    <h3 className="text-3xl font-display font-medium mt-1">{stats.productCount}</h3>
                </div>

                <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                            <Users size={20} />
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm uppercase tracking-widest">Stories Posted</p>
                    <h3 className="text-3xl font-display font-medium mt-1">{stats.blogCount}</h3>
                </div>
            </div>
        </div>
    );
}
