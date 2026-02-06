"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Address = {
    id: string;
    full_name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    is_default: boolean;
};

export async function getAddresses() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }

    return data as Address[];
}

export async function addAddress(address: Omit<Address, "id" | "is_default">) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // If this is the first address, make it default
    const { count } = await supabase
        .from("addresses")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

    const is_default = count === 0;

    const { data, error } = await supabase
        .from("addresses")
        .insert([{
            ...address,
            user_id: user.id,
            is_default
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/checkout");
    return data;
}

export async function deleteAddress(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/checkout");
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // 1. Unset all
    await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

    // 2. Set new default
    const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/checkout");
}
