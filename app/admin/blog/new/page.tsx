"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog } from "@/app/actions/blog";
import { uploadImage } from "@/app/actions/cloudinary";
import { Upload, Save, ArrowLeft, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [status, setStatus] = useState<"Draft" | "Published">("Draft");

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "vilksan-blog");

            const data = await uploadImage(formData);

            if (data.secure_url) {
                setCoverImage(data.secure_url);
                toast.success("Cover image uploaded");
            }
        } catch (e) {
            console.error(e);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!title) {
            toast.error("Please enter a title");
            return;
        }

        setLoading(true);
        try {
            await createBlog({
                title,
                excerpt,
                content,
                cover_image: coverImage,
                status
            });
            toast.success("Story created successfully");
            router.push("/admin/blog");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create story");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-display font-bold">New Story</h2>
                        <span className="text-neutral-500 text-sm">Drafting a new post</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-1">
                        <button
                            onClick={() => setStatus("Draft")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${status === "Draft" ? "bg-neutral-100 dark:bg-neutral-800 font-medium" : "text-neutral-500"}`}
                        >
                            Draft
                        </button>
                        <button
                            onClick={() => setStatus("Published")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${status === "Published" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium" : "text-neutral-500"}`}
                        >
                            Published
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Story
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Story Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-4xl font-display font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                        />
                    </div>

                    <div className="space-y-4">
                        <textarea
                            placeholder="Start writing your story..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[60vh] resize-none bg-transparent border-none outline-none text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                        />
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <ImageIcon size={16} /> Cover Image
                        </h3>
                        <div className="space-y-3">
                            {coverImage ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-neutral-50">
                                    <Image src={coverImage} alt="Cover" fill className="object-cover" />
                                    <button
                                        onClick={() => setCoverImage("")}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500/80 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-neutral-50 dark:bg-neutral-900/50">
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-neutral-400" />
                                    ) : (
                                        <>
                                            <Upload className="text-neutral-400 mb-2" />
                                            <span className="text-xs text-neutral-500">Upload Cover</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                        <h3 className="font-medium mb-3">Excerpt (Short Summary)</h3>
                        <textarea
                            rows={4}
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
                            placeholder="A brief description for the blog list..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
