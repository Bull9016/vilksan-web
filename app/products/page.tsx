import { getProducts, type Product } from "@/app/actions/product";
import ProductFilter from "@/components/products/ProductFilter";
import { EditableText } from "@/components/ui/EditableText";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
    const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
    const sort = searchParams.sort as any;
    const featured = searchParams.featured === "true";
    const trending = searchParams.trending === "true";
    const size = searchParams.size as string | undefined;

    const products = await getProducts({
        minPrice,
        maxPrice,
        sort,
        featured,
        trending,
        sizes: size ? [size] : undefined
    });

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-24 text-center max-w-2xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">The Collection</span>
                    <EditableText
                        contentKey="products_page_title"
                        initialValue="Essentials for the modern minimalist."
                        as="h1"
                        className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
                    />
                    <EditableText
                        contentKey="products_page_desc"
                        initialValue="Designed with precision, crafted for longevity. Explore our latest arrivals."
                        as="p"
                        className="text-lg text-neutral-500 leading-relaxed"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Sidebar */}
                    <ProductFilter />

                    {/* Product Grid */}
                    <div className="flex-1 w-full">
                        <div className="mb-6 text-sm text-neutral-500 font-mono text-right">
                            {products.length} Products
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 border-t border-neutral-100 dark:border-neutral-800">
                                <p className="text-neutral-500">No products found matching your filters.</p>
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
                                                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                                                    {product.collection_id ? "Collection" : "Basic"}
                                                </p>
                                            </div>
                                            <p className="font-mono text-sm">{formatCurrency(product.price)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
