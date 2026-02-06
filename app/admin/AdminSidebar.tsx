"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, PenTool, Settings, LogOut, Edit3 } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products & Orders", icon: ShoppingBag },
        { href: "/admin/collections", label: "Collections", icon: LayoutDashboard },
        { href: "/admin/blog", label: "Blog Management", icon: PenTool },
        { href: "/admin/content", label: "Site Content", icon: Edit3 },

        { href: "/admin/footer", label: "Footer", icon: LayoutDashboard },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h1 className="text-2xl font-display font-bold uppercase tracking-tighter">Vilksan</h1>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Admin Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                                    : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
