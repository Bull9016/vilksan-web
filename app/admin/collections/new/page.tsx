
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCollection } from "@/app/actions/product";
import { uploadImage } from "@/app/actions/cloudinary";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function NewCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [slug, setSlug] = useState("");
    const [image, setImage] = useState("");

    const handleImageUpload = async (files: FileList) => {
        if (!files[0]) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", files[0]);
            formData.append("folder", "vilksan-collections");

            const data = await uploadImage(formData);
            if (data.secure_url) {
                setImage(data.secure_url);
                toast.success("Image uploaded");
            }
        } catch (e) {
            console.error(e);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !slug) {
            toast.error("Title and Slug are required");
            return;
        }

        setLoading(true);
        try {
            await createCollection({
                title,
                description,
                slug: slug.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
                image,
                created_at: new Date().toISOString()
            });
            toast.success("Collection created");
            router.push("/admin/collections");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create collection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/collections" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-display font-bold">New Collection</h2>
                        <span className="text-neutral-500 text-sm">Create a new product series</span>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Create Collection
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Collection Title</label>
                            <input
                                type="text"
                                placeholder="E.g. Spring 2026"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setSlug(e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
                                }}
                                className="w-full text-xl font-display font-bold bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Collection story and details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Slug (URL)</label>
                            <input
                                type="text"
                                placeholder="spring-2026"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar / Image */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                        <h3 className="font-medium mb-4 flex items-center gap-2">
                            <ImageIcon size={18} /> Cover Image
                        </h3>

                        <div className="relative aspect-[2/1] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 group">
                            {image ? (
                                <>
                                    <Image src={image} alt="Cover" fill className="object-cover" />
                                    <button
                                        onClick={() => setImage("")}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-neutral-400" />
                                    ) : (
                                        <>
                                            <Upload className="text-neutral-400 mb-2" />
                                            <span className="text-xs text-neutral-500">Upload Banner</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">Recommended: 21:9 aspect ratio or wider.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
