"use server";

import { createClient } from "@supabase/supabase-js";

// Public client (respects RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client (bypasses RLS for admin actions)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ProductVariant = {
    id: string;
    product_id: string;
    size: string;
    color: string;
    color_code: string;
    stock: number;
    sku: string;
};

export type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
    bg_text: string;
    media: string[];
    styles?: any; // JSONB for flexible styling
    cover_image?: string; // New field
    stock: number; // Aggregate stock or default
    featured: boolean;
    trending: boolean;
    slug: string;
    details?: string;
    fabric_care?: string;
    shipping_info?: string;
    collection_id?: string;
    variants?: ProductVariant[];
    created_at: string;
    category_id?: string;
};

export type Collection = {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    created_at: string;
};

// --- PRODUCTS ---

import { isAuthenticated } from "./auth";

export async function getProducts(filters?: {
    featured?: boolean;
    trending?: boolean;
    collection?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    sort?: "newest" | "price_asc" | "price_desc";
}) {
    let query = supabase.from("products").select("*, variants:product_variants(*)");
    // ... (rest of getProducts logic remains same, it's public)
    if (filters?.featured) query = query.eq("featured", true);
    if (filters?.trending) query = query.eq("trending", true);
    if (filters?.collection) query = query.eq("collection_id", filters.collection);
    if (filters?.category) query = query.eq("category_id", filters.category);

    if (filters?.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters?.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

    if (filters?.colors && filters.colors.length > 0) {
        query = supabase.from("products").select("*, variants!inner(*)")
            .in("variants.color", filters.colors);
    }
    if (filters?.sizes && filters.sizes.length > 0) {
        query = supabase.from("products").select("*, variants!inner(*)")
            .in("variants.size", filters.sizes);
    }

    if (filters?.sort === "price_asc") {
        query = query.order("price", { ascending: true });
    } else if (filters?.sort === "price_desc") {
        query = query.order("price", { ascending: false });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let filteredData = data as Product[];

    if (filters?.colors && filters.colors.length > 0) {
        filteredData = filteredData.filter(p =>
            p.variants?.some(v => filters.colors?.includes(v.color))
        );
    }
    if (filters?.sizes && filters.sizes.length > 0) {
        filteredData = filteredData.filter(p =>
            p.variants?.some(v => filters.sizes?.includes(v.size))
        );
    }

    return filteredData;
}

export async function getProduct(id: string) {
    const { data, error } = await supabase.from("products").select("*, variants:product_variants(*)").eq("id", id).single();
    if (error) return null;
    return data as Product;
}

export async function getProductBySlug(slug: string) {
    const { data, error } = await supabase.from("products").select("*, variants:product_variants(*)").eq("slug", slug).single();
    if (error) return null;
    return data as Product;
}

export async function createProduct(product: Partial<Product>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");

    // Separate variants from product data
    const { variants, ...productData } = product;
    // ... rest of logic
    if (!productData.cover_image && productData.media && productData.media.length > 0) {
        productData.cover_image = productData.media[0];
    }
    if (!productData.slug && productData.title) {
        productData.slug = productData.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    const { data: newProduct, error } = await supabaseAdmin.from("products").insert([productData]).select().single();
    if (error) throw new Error(error.message);

    if (variants && variants.length > 0) {
        const variantsWithId = variants.map(v => ({ ...v, product_id: newProduct.id }));
        const { error: variantError } = await supabaseAdmin.from("product_variants").insert(variantsWithId);
        if (variantError) throw new Error(variantError.message);
    }

    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");

    const { variants, ...productData } = updates;
    // ... rest of logic
    if (!productData.cover_image && productData.media && productData.media.length > 0) {
        productData.cover_image = productData.media[0];
    }

    const { data: updatedProduct, error } = await supabaseAdmin.from("products").update(productData).eq("id", id).select().single();
    if (error) throw new Error(error.message);

    if (variants) {
        if (variants.length > 0) {
            const variantsToUpsert = variants.map(v => ({ ...v, product_id: id }));
            const { error: upsertError } = await supabaseAdmin.from("product_variants").upsert(variantsToUpsert);
            if (upsertError) throw new Error(upsertError.message);

            const keepIds = variantsToUpsert.map(v => v.id).filter(Boolean);
            if (keepIds.length > 0) {
                const { error: deleteError } = await supabaseAdmin
                    .from("product_variants")
                    .delete()
                    .eq("product_id", id)
                    .not("id", "in", `(${keepIds.join(",")})`);
                if (deleteError) console.warn("Failed to prune variants (likely in use):", deleteError);
            }
        } else {
            const { error: deleteError } = await supabaseAdmin.from("product_variants").delete().eq("product_id", id);
            if (deleteError) console.warn("Failed to delete all variants:", deleteError);
        }
    }

    return updatedProduct;
}

export async function deleteProduct(id: string) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
}


// --- COLLECTIONS ---

export async function getCollections() {
    const { data, error } = await supabase.from("collections").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Collection[];
}


export async function createCollection(collection: Partial<Collection>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { data, error } = await supabaseAdmin.from("collections").insert([collection]).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function getCollection(id: string) {
    const { data, error } = await supabase.from("collections").select("*").eq("id", id).single();
    if (error) return null;
    return data as Collection;
}

export async function getCollectionBySlug(slug: string) {
    const { data, error } = await supabase.from("collections").select("*").eq("slug", slug).single();
    if (error) return null;
    return data as Collection;
}

export async function updateCollection(id: string, updates: Partial<Collection>) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { data, error } = await supabaseAdmin.from("collections").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteCollection(id: string) {
    if (!await isAuthenticated()) throw new Error("Unauthorized");
    const { error } = await supabaseAdmin.from("collections").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
