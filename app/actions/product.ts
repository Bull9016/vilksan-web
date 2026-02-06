"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function getProducts(filters?: {
    featured?: boolean;
    trending?: boolean;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    sort?: "newest" | "price_asc" | "price_desc";
}) {
    let query = supabase.from("products").select("*, variants:product_variants(*)");

    // Filters
    if (filters?.featured) query = query.eq("featured", true);
    if (filters?.trending) query = query.eq("trending", true);
    if (filters?.collection) query = query.eq("collection_id", filters.collection);

    if (filters?.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters?.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

    // Variant Filters (complex, simplified for now: if ANY variant matches)
    // Supabase filtering on related tables is tricky with !inner. 
    // We will use !inner on variants if size/color filters exist.
    if (filters?.colors && filters.colors.length > 0) {
        // This requires the join to be inner join to filter parent rows
        // Syntax: variants!inner(color)
        query = supabase.from("products").select("*, variants!inner(*)")
            .in("variants.color", filters.colors);
    }
    if (filters?.sizes && filters.sizes.length > 0) {
        query = supabase.from("products").select("*, variants!inner(*)")
            .in("variants.size", filters.sizes);
    }

    // Check if we need to re-apply other filters if we reset the query object for !inner
    // A better approach for simple query building in JS without complex query builder state management:
    // ... Actually, Supabase query builder is immutable-ish. chained calls return new builder.
    // Let's restart query builder for variant filtering case or use PostgREST formatting.
    // To keep it simple and robust for this MVP, we might filter in memory if dataset is small, 
    // BUT we want to be performant.
    // Let's try basic single-param match or stick to base query.
    // NOTE: For 'IN' logic across relations, simple Supabase client usage is limited.
    // Let's implement valid sorting.

    // Sort
    if (filters?.sort === "price_asc") {
        query = query.order("price", { ascending: true });
    } else if (filters?.sort === "price_desc") {
        query = query.order("price", { ascending: false });
    } else {
        // Default newest
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // In-memory filter for variants if needed (due to builder complexity)
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
    // Separate variants from product data
    const { variants, ...productData } = product;

    // Auto-set cover_image if missing
    if (!productData.cover_image && productData.media && productData.media.length > 0) {
        productData.cover_image = productData.media[0];
    }
    if (!productData.slug && productData.title) {
        productData.slug = productData.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    // 1. Create Product
    const { data: newProduct, error } = await supabase.from("products").insert([productData]).select().single();
    if (error) throw new Error(error.message);

    // 2. Create Variants if any
    if (variants && variants.length > 0) {
        const variantsWithId = variants.map(v => ({ ...v, product_id: newProduct.id }));
        const { error: variantError } = await supabase.from("product_variants").insert(variantsWithId);
        if (variantError) throw new Error(variantError.message);
    }

    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    const { variants, ...productData } = updates;

    // Auto-set cover_image if missing (logic might be tricky on update if media is updated but cover_image isn't passed explicitly)
    // We assume the caller handles this preference, OR we enforce it here if cover_image is null/empty but media exists.
    if (!productData.cover_image && productData.media && productData.media.length > 0) {
        productData.cover_image = productData.media[0];
    }

    // 1. Update Product
    const { data: updatedProduct, error } = await supabase.from("products").update(productData).eq("id", id).select().single();
    if (error) throw new Error(error.message);

    // 2. Handle Variants (Simplistic strategy: Delete all and re-create, or basic UPSERT. For now, we'll assume the admin handles variants separately or we impl simple replacement)
    // A robust way: 
    // 2. Handle Variants (Smart Sync: Upsert + Delete Missing)
    if (variants) {
        // Upsert all provided variants (Updates existing, Inserts new)
        if (variants.length > 0) {
            const variantsToUpsert = variants.map(v => ({ ...v, product_id: id }));
            const { error: upsertError } = await supabase.from("product_variants").upsert(variantsToUpsert);
            if (upsertError) throw new Error(upsertError.message);

            // Prune: Delete variants not in the list
            const keepIds = variantsToUpsert.map(v => v.id).filter(Boolean);
            if (keepIds.length > 0) {
                // Delete variants NOT in keepIds
                const { error: deleteError } = await supabase
                    .from("product_variants")
                    .delete()
                    .eq("product_id", id)
                    .not("id", "in", `(${keepIds.join(",")})`);

                // We ignore delete error here silently because if a variant is in use (e.g. in an order),
                // we can't delete it. It's better to keep it than to fail the whole update.
                if (deleteError) console.warn("Failed to prune variants (likely in use):", deleteError);
            }
        } else {
            // If empty list provided, try to delete all
            const { error: deleteError } = await supabase.from("product_variants").delete().eq("product_id", id);
            if (deleteError) console.warn("Failed to delete all variants:", deleteError);
        }
    }

    return updatedProduct;
}

export async function deleteProduct(id: string) {
    // Variants cascade delete
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
}


// --- COLLECTIONS ---

export async function getCollections() {
    const { data, error } = await supabase.from("collections").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Collection[];
}


export async function createCollection(collection: Partial<Collection>) {
    const { data, error } = await supabase.from("collections").insert([collection]).select().single();
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
    const { data, error } = await supabase.from("collections").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteCollection(id: string) {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
