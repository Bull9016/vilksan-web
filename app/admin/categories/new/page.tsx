"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/app/actions/category";
import { uploadImage } from "@/app/actions/cloudinary";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminNewCategoryPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "vilksan-categories"); // Organized folder

            const res = await uploadImage(formData);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            if (res.secure_url) {
                setImage(res.secure_url);
                toast.success("Image uploaded");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error("Title is required");
            return;
        }

        setSaving(true);
        try {
            await createCategory({
                title,
                slug: slug || undefined, // let backend generate if empty
                description,
                image
            });
            toast.success("Category created!");
            router.push("/admin/categories");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Link href="/admin/categories" className="flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white mb-8 transition-colors">
                <ArrowLeft size={16} />
                Back to Categories
            </Link>

            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
                <h2 className="text-xl font-display font-bold mb-6">Create Category</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Streetwear"
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Slug (Optional)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. streetwear (auto-generated if empty)"
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Brief description for SEO and display..."
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Cover Image</label>

                        {image ? (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                                <Image src={image} alt="Preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImage("")}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                {uploading ? (
                                    <Loader2 className="animate-spin text-neutral-400" />
                                ) : (
                                    <>
                                        <Upload className="text-neutral-400 mb-2" />
                                        <span className="text-sm text-neutral-500 font-medium">Click to upload image</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        )}
                    </div>

                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="animate-spin w-4 h-4" />}
                            {saving ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
