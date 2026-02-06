"use client";

import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);

    if (error) {
        toast.error(error);
    }

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await signup(formData);
        } catch (e) {
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-neutral-50 dark:bg-neutral-900">
            <div className="w-full max-w-sm space-y-8 bg-white dark:bg-black p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold font-display uppercase tracking-widest">Create Account</h1>
                    <p className="mt-2 text-sm text-neutral-500">Join VILKSAN today</p>
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
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-neutral-500">Already have an account? </span>
                    <Link href="/login" className="font-bold underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
