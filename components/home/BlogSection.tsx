"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Blog } from "@/app/actions/blog";
import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "@/components/ui/EditableImage";

export default function BlogSection({ blogs }: { blogs: Blog[] }) {
    if (!blogs || blogs.length === 0) return null;

    // Use only the latest 3 blogs max
    const displayedBlogs = blogs.slice(0, 3);

    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
                {displayedBlogs.map((blog, index) => {
                    const isEven = index % 2 === 0;

                    return (
                        <div key={blog.id} className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center ${!isEven ? "md:flex-row-reverse" : ""}`}>
                            {/* Text Content */}
                            <div className="flex-1 space-y-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    Editorial — {new Date(blog.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                                    {blog.title}
                                </h2>
                                <p className="text-lg text-neutral-500 leading-relaxed line-clamp-3">
                                    {blog.excerpt || "Read the latest story from our editorial team."}
                                </p>
                                <Link
                                    href={`/blog/${blog.id}`}
                                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-50 transition-opacity"
                                >
                                    Read Story <ArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Image Content */}
                            <div className="flex-1 w-full aspect-[4/5] relative bg-neutral-100 dark:bg-neutral-900">
                                <img
                                    src={blog.cover_image || "https://images.unsplash.com/photo-1445053023192-8d45cb5d8c4b?q=80&w=2074&auto=format&fit=crop"}
                                    alt={blog.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
