import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    // 1. Update Supabase Session
    // This allows refreshing auth tokens for customer login
    const response = await updateSession(request);

    // 2. Admin Check Logic (Existing)
    // Check if accessing admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // Allow public access to login page
        if (request.nextUrl.pathname === "/admin/login") {
            return NextResponse.next();
        }

        // Check for admin cookie
        const adminCookie = request.cookies.get(process.env.ADMIN_COOKIE_NAME || "vilksan_admin_session");

        // If no cookie, redirect to login
        if (!adminCookie) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // If accessing root /admin, redirect to dashboard
        if (request.nextUrl.pathname === "/admin") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
    }

    // 3. Customer Auth Logic
    // We rely on page-level redirects for /account to keep middleware lightweight
    // The critical part is that updateSession (above) runs on all routes due to the matcher below.

    // If returning next(), return the response from updateSession to persist cookies
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
