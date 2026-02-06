"use client";

import { useState } from "react";
import { getStatements } from "@/app/actions/stats";
import { formatCurrency } from "@/utils/format";
import { Download, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function StatementGenerator() {
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState("30"); // days

    const generateStatement = async () => {
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - parseInt(range));

            const data = await getStatements(startDate, endDate);

            if (!data || data.length === 0) {
                toast.error("No orders found in this period");
                return;
            }

            // Convert to CSV
            const headers = ["Order ID", "Date", "Status", "Items", "Total Amount"];
            const csvContent = [
                headers.join(","),
                ...data.map((order: any) => [
                    order.id,
                    new Date(order.created_at).toLocaleDateString(),
                    order.status,
                    `"${(order.items || []).length} items"`,
                    order.total_amount
                ].join(","))
            ].join("\n");

            // Download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `statement-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Statement generated successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate statement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold">Statements & Reports</h3>
                    <p className="text-neutral-500 text-sm mt-1">Download detailed transaction history.</p>
                </div>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                    <FileText size={20} />
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 block mb-2">
                        Time Period
                    </label>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 3 Months</option>
                        <option value="365">Last Year</option>
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        onClick={generateStatement}
                        disabled={loading}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        Download CSV
                    </button>
                    <p className="text-xs text-center text-neutral-400 mt-3">
                        Includes valid transactions only. Refunds processed separately.
                    </p>
                </div>
            </div>
        </div>
    );
}
