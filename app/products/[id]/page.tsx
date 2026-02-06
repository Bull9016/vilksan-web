
import { getProduct, getProductBySlug, getProducts, getCollection, type Product } from "@/app/actions/product";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/products/ProductActions";
import ProductAccordions from "@/components/products/ProductAccordions";
import ProductDetailsSection from "@/components/products/ProductDetailsSection";

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
        <main className="min-h-screen bg-neutral-100 dark:bg-black text-foreground pt-36 pb-20">
            <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                    {/* Left Column: Brand/Collection Branding & Desc */}
                    <div className="lg:col-span-4 lg:sticky lg:top-40 order-2 lg:order-1 flex flex-col justify-center h-full">
                        <div className="mb-12">
                            {/* Background Text */}
                            <h1
                                className="font-display font-black leading-[0.8] mb-4 tracking-tighter opacity-10 dark:opacity-20 select-none absolute -z-10 truncate max-w-full pointer-events-none"
                                style={{
                                    fontSize: product.styles?.bgText?.fontSize ? `${product.styles.bgText.fontSize}px` : '10rem',
                                    left: product.styles?.bgText?.x ? `${product.styles.bgText.x}px` : '-5rem',
                                    top: product.styles?.bgText?.y ? `${product.styles.bgText.y}px` : '0',
                                    color: product.styles?.bgText?.color,
                                    fontFamily: product.styles?.bgText?.fontFamily || 'var(--font-inter)'
                                }}
                            >
                                {product.bg_text || (collection?.title ? collection.title.split(' ')[0] : "VILKSAN")}
                            </h1>

                            <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-4 leading-none relative z-10">
                                {collection?.title || "VILKSAN"}
                                <span className="text-brand-500 text-6xl">.</span>
                            </h2>
                            <div className="w-20 h-1 bg-black dark:bg-white mb-8"></div>

                            <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{product.title}</h1>
                            <p className="text-xl font-mono text-neutral-500 mb-6">₹{product.price.toLocaleString('en-IN')}</p>

                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm max-w-sm mb-8">
                                {product.description}
                            </p>

                            {/* Details Toggle Section */}
                            <div className="mt-8">
                                <ProductDetailsSection items={accordionItems} />
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Hero Image Gallery */}
                    <div className="lg:col-span-4 order-1 lg:order-2 space-y-4">
                        {product.media && product.media.length > 0 ? (
                            product.media.map((url, index) => (
                                <div key={index} className="aspect-[3/4] relative bg-neutral-200 dark:bg-neutral-900 w-full overflow-hidden shadow-2xl">
                                    <Image
                                        src={url}
                                        alt={`${product.title} - View ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="aspect-[3/4] relative bg-neutral-200 dark:bg-neutral-900 w-full overflow-hidden shadow-2xl flex items-center justify-center text-neutral-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Right Column: Actions Only */}
                    <div className="lg:col-span-4 lg:sticky lg:top-40 order-3 lg:order-3 space-y-12 pt-12">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                                Configuration
                            </h3>
                            <ProductActions product={product} variants={product.variants} />
                        </div>
                    </div>
                </div>

                {/* Recommended Products */}
                <div className="mt-40 border-t border-neutral-200 dark:border-neutral-800 pt-20">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block">You might also like</span>
                            <h2 className="text-4xl font-display font-bold">Suggested for you</h2>
                        </div>
                    </div>
                    <RecommendedProducts products={recommendedProducts} />
                </div>
            </div>
        </main>
    );
}

import RecommendedProducts from "@/components/products/RecommendedProducts";
