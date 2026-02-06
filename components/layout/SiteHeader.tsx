"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export default function SiteHeader() {
    const { toggleCart, cartCount } = useCart();
    const [user, setUser] = useState<any>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        // Check for session on mount
        const checkUser = async () => {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        };
        checkUser();
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const scrolled = latest > 50;
        if (scrolled !== isScrolled) {
            setIsScrolled(scrolled);
        }
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [mobileMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // On non-home pages, always show background
    const showBackground = isScrolled || !isHome || mobileMenuOpen;

    // Do not render header on Admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${showBackground ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50" : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 -ml-2 z-50 relative"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className="font-display font-bold text-xl tracking-tighter z-50 relative">
                        VILKSAN.
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
                        <Link href="/products" className="text-sm font-medium hover:opacity-50 transition-opacity uppercase tracking-widest text-[10px]">Shop</Link>
                        <Link href="/collections" className="text-sm font-medium hover:opacity-50 transition-opacity uppercase tracking-widest text-[10px]">Collections</Link>
                        <Link href="/lookbook" className="text-sm font-medium hover:opacity-50 transition-opacity uppercase tracking-widest text-[10px]">Lookbook</Link>
                        <Link href="/about" className="text-sm font-medium hover:opacity-50 transition-opacity uppercase tracking-widest text-[10px]">About</Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 z-50 relative">
                        {user ? (
                            <Link href="/account" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors relative group">
                                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="sr-only">Account</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors group">
                                <User className="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                <span className="sr-only">Login</span>
                            </Link>
                        )}

                        <button
                            onClick={toggleCart}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors relative"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-white dark:bg-black pt-20 px-6 md:hidden flex flex-col"
                    >
                        <nav className="flex flex-col gap-6 mt-8">
                            <Link href="/products" className="text-3xl font-display font-bold uppercase tracking-tight" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                            <Link href="/collections" className="text-3xl font-display font-bold uppercase tracking-tight" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
                            <Link href="/lookbook" className="text-3xl font-display font-bold uppercase tracking-tight" onClick={() => setMobileMenuOpen(false)}>Lookbook</Link>
                            <Link href="/about" className="text-3xl font-display font-bold uppercase tracking-tight" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        </nav>

                        <div className="mt-auto mb-12 space-y-4">
                            {!user && (
                                <Link href="/login" className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-widest text-sm font-bold" onClick={() => setMobileMenuOpen(false)}>
                                    Login / Register
                                </Link>
                            )}
                            <div className="flex gap-4 text-sm text-neutral-500 uppercase tracking-widest">
                                <Link href="/terms">Terms</Link>
                                <Link href="/privacy">Privacy</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
