
import { getCollections } from "@/app/actions/product";
import { Link } from "lucide-react"; // Wait, wrong Link import.
import NextLink from "next/link";
import Image from "next/image";
import { EditableText } from "@/components/ui/EditableText";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
    const collections = await getCollections();

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-24 text-center max-w-2xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">The Series</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                        Collections
                    </h1>
                    <p className="text-lg text-neutral-500 leading-relaxed">
                        Curated drops and seasonal releases.
                    </p>
                </div>

                <div className="space-y-24">
                    {collections.length === 0 ? (
                        <div className="text-center py-24 border-t border-neutral-100 dark:border-neutral-800">
                            <p className="text-neutral-500">No collections released yet.</p>
                        </div>
                    ) : (
                        collections.map((collection, idx) => (
                            <NextLink
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                className="group block relative"
                            >
                                <div className="aspect-[21/9] relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden mb-8">
                                    {collection.image ? (
                                        <Image
                                            src={collection.image}
                                            alt={collection.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                            <span className="text-xs font-bold uppercase tracking-widest">No Cover Image</span>
                                        </div>
                                    )}
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8 group-hover:border-black dark:group-hover:border-white transition-colors">
                                    <div>
                                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                                            {collection.title}
                                        </h2>
                                        <p className="max-w-xl text-neutral-500 text-lg">
                                            {collection.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                                        View Collection <ArrowRight size={16} className="-ml-1 translate-x-0 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </NextLink>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
