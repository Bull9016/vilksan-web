"use client";

import { useEffect, useState } from "react";
import { getAdvancedStats, type AdvancedStats } from "@/app/actions/stats";
import { formatCurrency } from "@/utils/format";
import { IndianRupee, ShoppingBag, Users, Loader2, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import StatementGenerator from "@/components/admin/StatementGenerator";

function ClientClock() {
    const [time, setTime] = useState<string>("");
    useEffect(() => {
        setTime(new Date().toLocaleTimeString());
        const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(interval);
    }, []);
    if (!time) return null;
    return <>Last updated: {time}</>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdvancedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getAdvancedStats();
                setStats(data);
            } catch (e) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!stats) return <div className="p-10 text-center">Failed to load dashboard data.</div>;

    const MetricCard = ({ title, value, growth, icon: Icon, prefix = "" }: any) => {
        const isPositive = growth >= 0;
        return (
            <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                        <Icon size={20} />
                    </div>
                    {growth !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(growth).toFixed(1)}%
                        </div>
                    )}
                </div>
                <p className="text-neutral-500 text-sm uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-display font-medium mt-1">{prefix}{value}</h3>
                <p className="text-xs text-neutral-400 mt-2">vs. last month</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold">Dashboard</h2>
                    <p className="text-neutral-500">Business performance and analytics.</p>
                </div>
                <div className="text-sm text-neutral-400">
                    {/* Hydration safe time */}
                    <ClientClock />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    growth={stats.revenueGrowth}
                    icon={IndianRupee}
                />
                <MetricCard
                    title="Orders"
                    value={stats.orders}
                    growth={stats.ordersGrowth}
                    icon={ShoppingBag}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={formatCurrency(stats.averageOrderValue)}
                    growth={0} // No historical for AOV yet 
                    icon={ArrowUpRight}
                />
                <MetricCard
                    title="Active Products"
                    value={stats.products}
                    icon={Users} // Reuse icon or change to Package
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Charts Area */}
                <div className="xl:col-span-2">
                    <AnalyticsCharts stats={stats} />
                </div>

                {/* Sidebar / Tools */}
                <div className="space-y-6">
                    <StatementGenerator />

                    {/* Quick Stats or Tips could go here */}
                    <div className="bg-neutral-900 text-white p-6 rounded-xl">
                        <h3 className="font-bold mb-2">Pro Tip</h3>
                        <p className="text-sm text-neutral-400">
                            Compare your month-on-month growth to identify seasonal trends. Download statements for accounting at the end of each month.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
