
import { getCollectionBySlug, getProducts, getCollections, type Product } from "@/app/actions/product";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    const collections = await getCollections();
    return collections.map((collection) => ({
        slug: collection.slug,
    }));
}

export default async function SingleCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const collection = await getCollectionBySlug(slug);
    if (!collection) return notFound();

    const products = await getProducts({ collection: collection.id });

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Back Link */}
                <div className="mb-12">
                    <Link href="/collections" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={14} /> Back to Collections
                    </Link>
                </div>

                {/* Hero / Header */}
                <div className="mb-24">
                    <div className="max-w-4xl">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Collection</span>
                        <h1 className="text-5xl md:text-8xl font-display font-bold leading-none mb-8">
                            {collection.title}
                        </h1>
                        <p className="text-xl text-neutral-500 leading-relaxed max-w-2xl">
                            {collection.description}
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 border-t border-neutral-100 dark:border-neutral-800">
                        <p className="text-neutral-500">No products in this collection yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                        {products.map((product) => (
                            <Link key={product.id} href={`/products/${product.slug || product.id}`} className="group cursor-pointer block">
                                <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-4">
                                    {product.media && product.media[0] && (
                                        <Image
                                            src={product.media[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                    {/* Overlay Tags */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                                        {product.stock <= 0 && (
                                            <span className="bg-white/90 dark:bg-black/90 text-black dark:text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                Sold Out
                                            </span>
                                        )}
                                        {product.trending && product.stock > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                Hot
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold mb-1 group-hover:underline decoration-1 underline-offset-4">
                                            {product.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 line-clamp-1">{product.description}</p>
                                    </div>
                                    <p className="font-mono text-sm">${product.price.toFixed(2)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
