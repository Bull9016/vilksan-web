"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, deleteCategory, type Category } from "@/app/actions/category";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? Products in this category will be unlinked.")) return;

        setDeleting(id);
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            toast.success("Category deleted");
        } catch (error) {
            toast.error("Failed to delete category");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-display font-bold">Categories</h2>
                    <span className="text-neutral-500 text-sm">Manage product categories</span>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    New Category
                </Link>
            </div>

            {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="text-neutral-500 mb-4">No categories found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden group">
                            <div className="aspect-[2/1] relative bg-neutral-100 dark:bg-neutral-900">
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs font-bold uppercase tracking-widest">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Edit link could go here */}
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        disabled={deleting === category.id}
                                        className="bg-white/90 dark:bg-black/90 p-2 rounded-full hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                                    >
                                        {deleting === category.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1">{category.title}</h3>
                                <p className="text-xs text-neutral-500 font-mono">/{category.slug}</p>
                                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{category.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
