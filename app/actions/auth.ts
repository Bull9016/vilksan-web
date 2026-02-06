"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin_secret_123";
const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "vilksan_admin_session";

export async function login(password: string) {
    if (password === ADMIN_PASSWORD) {
        // Set HTTP-only cookie
        (await cookies()).set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}

export async function logout() {
    (await cookies()).delete(COOKIE_NAME);
    redirect("/admin/login");
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    return cookieStore.has(COOKIE_NAME);
}
