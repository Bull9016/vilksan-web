
import { getProduct, getProductBySlug, getProducts, getCollection, type Product } from "@/app/actions/product";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/products/ProductActions";
import ProductAccordions from "@/components/products/ProductAccordions";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({
        id: product.slug || product.id,
    }));
}

export default async function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Try by slug first, then ID
    let product = await getProductBySlug(id);
    if (!product) {
        product = await getProduct(id);
    }

    if (!product) return notFound();

    // Fetch Collection if exists
    const collection = product.collection_id ? await getCollection(product.collection_id) : null;

    // Fetch Recommended Products (from same collection or generic recent)
    let recommendedProducts = await getProducts({
        collection: product.collection_id,
        sort: "newest"
    });

    // Filter out current product
    recommendedProducts = recommendedProducts.filter(p => p.id !== product.id).slice(0, 10);

    // If not enough products in collection, fetch generic new arrivals
    if (recommendedProducts.length < 4) {
        const moreProducts = await getProducts({ sort: "newest" });
        const existingIds = new Set(recommendedProducts.map(p => p.id));
        existingIds.add(product.id);

        const additional = moreProducts
            .filter(p => !existingIds.has(p.id))
            .slice(0, 10 - recommendedProducts.length);

        recommendedProducts = [...recommendedProducts, ...additional];
    }

    // Prepare accordion items
    const accordionItems = [
        { title: "Details", content: product.details || product.description || "No specific details available." },
        { title: "Fabric & Care", content: product.fabric_care || "Machine wash cold. Do not tumble dry." },
        { title: "Shipping & Returns", content: product.shipping_info || "Free shipping on orders over $100. Returns accepted within 14 days of delivery." }
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href={collection ? `/collections/${collection.slug}` : "/products"}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} /> {collection ? `Back to ${collection.title}` : "Back to All Products"}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

                    {/* Left Column: Description & Details (Sticky) */}
                    <div className="lg:col-span-3 lg:sticky lg:top-32 order-2 lg:order-1 space-y-8">
                        <div className="lg:hidden">
                            <h1 className="text-3xl font-display font-bold leading-tight mb-2">{product.title}</h1>
                            <p className="text-lg font-mono mb-4">${product.price.toFixed(2)}</p>
                        </div>

                        <div className="prose dark:prose-invert prose-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Description</h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                                {product.description}
                            </p>
                        </div>

                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
                            <ProductAccordions items={accordionItems} />
                        </div>
                    </div>

                    {/* Center Column: Media Gallery (Scrollable) */}
                    <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                        {product.media && product.media.length > 0 ? (
                            product.media.map((img, idx) => (
                                <div key={idx} className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-900 w-full">
                                    <Image
                                        src={img}
                                        alt={`${product.title} ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={idx === 0}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-900 w-full flex items-center justify-center text-neutral-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Right Column: Actions (Sticky) */}
                    <div className="lg:col-span-3 lg:sticky lg:top-32 order-3 lg:order-3 space-y-8">
                        <div className="hidden lg:block mb-8">
                            {collection && (
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
                                    {collection.title}
                                </span>
                            )}
                            <h1 className="text-5xl font-display font-bold leading-none mb-4 tracking-tight">
                                {product.title}
                            </h1>
                            <p className="text-xl font-mono">${product.price.toFixed(2)}</p>
                        </div>

                        <ProductActions product={product} variants={product.variants} />
                    </div>
                </div>

                {/* Recommended Products */}
                <div className="mt-32">
                    <RecommendedProducts products={recommendedProducts} />
                </div>
            </div>
        </main>
    );
}

import RecommendedProducts from "@/components/products/RecommendedProducts";
