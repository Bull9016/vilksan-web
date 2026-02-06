import { getBlogs } from "@/app/actions/blog";
import { EditableText } from "@/components/ui/EditableText";
import BlogSection from "@/components/home/BlogSection";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    // Fetch published blogs
    const blogs = await getBlogs(true);

    return (
        <main className="min-h-screen bg-white dark:bg-black text-foreground pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">The Journal</span>
                    <EditableText
                        contentKey="blog_page_title"
                        initialValue="Stories of Craft and Culture."
                        as="h1"
                        className="text-5xl md:text-7xl font-display font-bold leading-tight mb-8"
                    />
                    <EditableText
                        contentKey="blog_page_desc"
                        initialValue="Behind the scenes, design philosophy, and the lifestyle of the modern minimalist."
                        as="p"
                        className="text-lg text-neutral-500 leading-relaxed"
                    />
                </div>

                {/* Blog Grid Reuse */}
                {blogs.length === 0 ? (
                    <div className="py-20 border-t border-neutral-100 dark:border-neutral-800">
                        <p className="text-neutral-500">No stories published yet.</p>
                    </div>
                ) : (
                    <div className="-mx-6 md:-mx-12">
                        <BlogSection blogs={blogs} />
                    </div>
                )}
            </div>
        </main>
    );
}
