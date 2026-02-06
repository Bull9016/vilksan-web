
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCollections, deleteCollection, type Collection } from "@/app/actions/product";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        try {
            const data = await getCollections();
            setCollections(data);
        } catch (error) {
            toast.error("Failed to load collections");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will not delete products, but will unlink them.")) return;

        setDeleting(id);
        try {
            await deleteCollection(id);
            setCollections(collections.filter(c => c.id !== id));
            toast.success("Collection deleted");
        } catch (error) {
            toast.error("Failed to delete collection");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-display font-bold">Collections</h2>
                    <span className="text-neutral-500 text-sm">Manage product series and drops</span>
                </div>
                <Link
                    href="/admin/collections/new"
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    New Collection
                </Link>
            </div>

            {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : collections.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="text-neutral-500 mb-4">No collections found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                        <div key={collection.id} className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden group">
                            <div className="aspect-[2/1] relative bg-neutral-100 dark:bg-neutral-900">
                                {collection.image ? (
                                    <Image
                                        src={collection.image}
                                        alt={collection.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs font-bold uppercase tracking-widest">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/collections/${collection.id}`} // We haven't built edit yet, but this is future proof
                                        className="bg-white/90 dark:bg-black/90 p-2 rounded-full hover:bg-white dark:hover:bg-black text-black dark:text-white"
                                    >
                                        <Edit size={14} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(collection.id)}
                                        disabled={deleting === collection.id}
                                        className="bg-white/90 dark:bg-black/90 p-2 rounded-full hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                                    >
                                        {deleting === collection.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1">{collection.title}</h3>
                                <p className="text-xs text-neutral-500 font-mono">/{collection.slug}</p>
                                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{collection.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
