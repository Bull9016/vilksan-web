import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { LogOut, User, Package } from "lucide-react";
import Link from "next/link";

export default async function AccountPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold uppercase tracking-widest">My Account</h1>
                    <form action={logout}>
                        <button className="flex items-center gap-2 text-red-500 hover:opacity-70 font-bold uppercase tracking-widest text-sm">
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </form>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="font-bold text-lg mb-1">Profile</h2>
                        <p className="text-neutral-500 text-sm mb-4">{user.email}</p>
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-widest">
                            Active Member
                        </div>
                    </div>

                    {/* Orders Card (Placeholder) */}
                    <div className="md:col-span-2 bg-white dark:bg-black p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="w-6 h-6" />
                            <h2 className="font-bold text-lg">Order History</h2>
                        </div>

                        <div className="text-center py-12 text-neutral-500">
                            <p>No orders found.</p>
                            <Link href="/products" className="text-black dark:text-white font-bold underline mt-2 block">
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
