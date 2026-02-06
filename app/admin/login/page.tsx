"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await login(password);
            if (res.success) {
                toast.success("Welcome back");
                router.push("/admin/dashboard");
                router.refresh();
            } else {
                toast.error(res.error || "Invalid password");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={20} />
                    </div>
                    <h1 className="font-display font-bold text-2xl uppercase tracking-widest">Admin Access</h1>
                    <p className="text-neutral-500 text-sm mt-2">Restricted Area</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-black dark:focus:border-white transition-colors"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="animate-spin" size={16} />}
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}
