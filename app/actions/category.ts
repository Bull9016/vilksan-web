"use server";

import { createClient } from "@supabase/supabase-js";
import { isAuthenticated } from "./auth";

// Public client for reading (respects RLS, good for fetching)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client for writing (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Category = {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    created_at: string;
};

export async function getCategories() {
    const { data, error } = await supabase.from("categories").select("*").order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data as Category[];
}

export async function getCategory(id: string) {
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
    if (error) return null;
    return data as Category;
}

export async function createCategory(category: Partial<Category>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");

    // Auto-generate slug if not provided
    if (!category.slug && category.title) {
        category.slug = category.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    const { data, error } = await supabaseAdmin.from("categories").insert([category]).select().single();
    if (error) throw new Error(error.message);
    return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { data, error } = await supabaseAdmin.from("categories").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as Category;
}

export async function deleteCategory(id: string) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
