import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAddresses } from "@/app/actions/user";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Enforce Login
    if (!user) {
        redirect("/login?next=/checkout");
    }

    // 2. Fetch Addresses
    const addresses = await getAddresses();

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-display font-bold mb-8">Checkout</h1>
                <CheckoutClient user={user} initialAddresses={addresses} />
            </div>
        </div>
    );
}
