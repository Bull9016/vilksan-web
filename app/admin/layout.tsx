import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/actions/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Server-side authentication check
    // This runs on the server before rendering the layout
    const isAuth = await isAuthenticated();

    if (!isAuth) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex text-neutral-900 dark:text-white font-sans">
            {/* Sidebar (Client Component) */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
