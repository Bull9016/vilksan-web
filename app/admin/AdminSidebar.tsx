"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, PenTool, Settings, LogOut, Edit3, Menu, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products & Orders", icon: ShoppingBag },
        { href: "/admin/categories", label: "Categories", icon: ShoppingBag },
        { href: "/admin/collections", label: "Collections", icon: LayoutDashboard },
        { href: "/admin/showcase", label: "Home Showcase", icon: LayoutDashboard },
        { href: "/admin/blog", label: "Blog Management", icon: PenTool },
        { href: "/admin/content", label: "Site Content", icon: Edit3 },
        { href: "/admin/footer", label: "Footer", icon: LayoutDashboard },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    // Close on navigation
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold uppercase tracking-tighter">Vilksan</h1>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Admin Portal</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="md:hidden p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        </>
    );

    return (
        <>
            {/* Mobile Header - Visible only on mobile */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 w-full">
                <span className="font-display font-bold text-lg uppercase tracking-tight">Admin Portal</span>
                <button onClick={() => setIsOpen(true)} className="p-2 -mr-2">
                    <Menu size={24} />
                </button>
            </div>

            {/* Desktop Sidebar - Hidden on mobile */}
            <aside className="w-64 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 hidden md:flex flex-col h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Interactive Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-black z-50 flex flex-col md:hidden border-r border-neutral-200 dark:border-neutral-800 shadow-xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
