
import { getBlog, getBlogs, type Blog } from "@/app/actions/blog";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    const blogs = await getBlogs(true);
    return blogs.map((blog) => ({
        id: blog.id,
    }));
}

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const blog = await getBlog(id);

    if (!blog) return notFound();

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <article className="max-w-4xl mx-auto px-6 md:px-12">
                {/* Back Link */}
                <div className="mb-12">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Back to Journal
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs uppercase tracking-widest text-neutral-500 mb-6">
                        <span>{new Date(blog.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Journal</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-8">
                        {blog.title}
                    </h1>
                    <p className="text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                        {blog.excerpt}
                    </p>
                </header>

                {/* Cover Image */}
                {blog.cover_image && (
                    <div className="aspect-video relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-16">
                        <Image
                            src={blog.cover_image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    {/* Basic rendering of text content with line breaks. 
                        In a real app, you might use a Markdown renderer or Rich Text renderer. */}
                    {blog.content.split('\n').map((paragraph, index) => (
                        paragraph.trim() && <p key={index} className="mb-6 leading-relaxed text-neutral-800 dark:text-neutral-300">{paragraph}</p>
                    ))}
                </div>
            </article>
        </main>
    );
}
