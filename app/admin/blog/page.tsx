"use client";

import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Loader2 } from "lucide-react";
import { getBlogs, deleteBlog, type Blog } from "@/app/actions/blog";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminBlog() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBlogs();
    }, []);

    const loadBlogs = async () => {
        try {
            const data = await getBlogs();
            setBlogs(data);
        } catch (error) {
            toast.error("Failed to load stories");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this story?")) return;
        try {
            await deleteBlog(id);
            setBlogs(blogs.filter(b => b.id !== id));
            toast.success("Story deleted");
        } catch (error) {
            toast.error("Failed to delete story");
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold">Journal</h2>
                    <p className="text-neutral-500">Curate your stories.</p>
                </div>
                <Link href="/admin/blog/new">
                    <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        <Plus size={18} />
                        New Story
                    </button>
                </Link>
            </div>

            {blogs.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">No stories yet. Create your first one.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl flex flex-col justify-between h-48 hover:shadow-lg transition-shadow bg-cover bg-center relative overflow-hidden group">
                            {/* Background Image Overlay if exists */}
                            {blog.cover_image && (
                                <div
                                    className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center"
                                    style={{ backgroundImage: `url(${blog.cover_image})` }}
                                />
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-xs uppercase tracking-widest px-2 py-1 rounded-full ${blog.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'}`}>
                                        {blog.status || 'Draft'}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/blog/${blog.id}`}>
                                            <button className="text-neutral-500 hover:text-black dark:hover:text-white p-1"><Edit3 size={16} /></button>
                                        </Link>
                                        <button onClick={() => handleDelete(blog.id)} className="text-neutral-500 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-medium line-clamp-2">{blog.title}</h3>
                            </div>
                            <p className="relative z-10 text-xs text-neutral-500">
                                {new Date(blog.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
