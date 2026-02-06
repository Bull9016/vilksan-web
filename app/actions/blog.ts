"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Blog = {
    id: string;
    title: string;
    excerpt: string;
    content: string; // JSON string or HTML
    cover_image: string;
    status: "Draft" | "Published";
    created_at: string;
};

export async function getBlogs(onlyPublished = false) {
    let query = supabase.from("blogs").select("*").order("created_at", { ascending: false });

    if (onlyPublished) {
        query = query.eq("status", "Published");
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Blog[];
}

export async function getBlog(id: string) {
    const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
    if (error) return null;
    return data as Blog;
}

export async function createBlog(blog: Partial<Blog>) {
    const { data, error } = await supabase.from("blogs").insert([blog]).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateBlog(id: string, updates: Partial<Blog>) {
    const { data, error } = await supabase.from("blogs").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteBlog(id: string) {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
