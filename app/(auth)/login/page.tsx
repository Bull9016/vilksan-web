"use client";

import Link from "next/link";
import { login } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const [isLoading, setIsLoading] = useState(false);

    if (error) {
        toast.error(error);
    }
    if (message) {
        toast.success(message);
    }

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await login(formData);
        } catch (e) {
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-neutral-50 dark:bg-neutral-900">
            <div className="w-full max-w-sm space-y-8 bg-white dark:bg-black p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold font-display uppercase tracking-widest">Welcome Back</h1>
                    <p className="mt-2 text-sm text-neutral-500">Sign in to your account</p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-black dark:focus:border-white outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-neutral-500">Don't have an account? </span>
                    <Link href="/signup" className="font-bold underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
