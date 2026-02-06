"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAuthenticated } from "@/app/actions/auth";

// Create a Service Role client for admin actions (bypasses RLS)
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !key) {
        throw new Error("Missing Supabase URL or Service Role Key");
    }
    return createAdminClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Fetch content by key, return default if not found
export async function getContent(key: string, defaultValue: string = "") {
    const supabase = await createClient(); // Use public client for reading
    const { data, error } = await supabase
        .from("content_blocks")
        .select("value, style")
        .eq("key", key)
        .single();

    if (error || !data) return { value: defaultValue, style: {} };
    return { value: data.value, style: data.style || {} };
}

// Save content (upsert)
export async function saveContent(key: string, value: string, type: "text" | "image" | "video" | "select" | "textarea" = "text", style: any = {}) {
    if (!await isAuthenticated()) {
        throw new Error("Unauthorized");
    }

    const supabase = getAdminClient(); // Use admin client for writing
    const { error } = await supabase
        .from("content_blocks")
        .upsert({ key, value, type, style, updated_at: new Date().toISOString() });

    if (error) {
        console.error("Error saving content:", error);
        throw new Error("Failed to save content");
    }
}

// --- HOME GRID ITEMS ---

export type GridItem = {
    id: string;
    position: number;
    image_url: string;
    subtitle?: string;
    title: string;
    description: string;
    link_url: string;
    link_text: string;
    text_color: string;
};

export async function getGridItems() {
    const supabase = await createClient(); // Use public client for reading
    const { data, error } = await supabase
        .from("home_grid_items")
        .select("*")
        .order("position", { ascending: true });

    if (error) {
        console.error("Error fetching grid items:", error);
        if (error instanceof Error) {
            console.error("Error stack:", error.stack);
        } else {
            console.error("Error details:", JSON.stringify(error, null, 2));
        }
        return [];
    }
    return data as GridItem[];
}

export async function updateGridItem(id: string, updates: Partial<GridItem>) {
    if (!await isAuthenticated()) {
        throw new Error("Unauthorized");
    }

    const supabase = getAdminClient(); // Use admin client for writing
    const { error } = await supabase
        .from("home_grid_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        console.error("Error updating grid item:", error);
        throw new Error("Failed to update grid item");
    }
}
