"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { getContent, saveContent } from "@/app/actions/content";
import { toast } from "sonner";

// Helper for editing link lists (JSON)
function LinkListEditor({
    linksJson,
    onChange,
    title
}: {
    linksJson: string,
    onChange: (json: string) => void,
    title: string
}) {
    const [links, setLinks] = useState<{ href: string; label: string }[]>([]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(linksJson);
            if (Array.isArray(parsed)) setLinks(parsed);
        } catch {
            setLinks([]);
        }
    }, [linksJson]);

    const updateLink = (index: number, key: 'href' | 'label', value: string) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [key]: value };
        setLinks(newLinks);
        onChange(JSON.stringify(newLinks));
    };

    const addLink = () => {
        const newLinks = [...links, { href: "#", label: "New Link" }];
        setLinks(newLinks);
        onChange(JSON.stringify(newLinks));
    };

    const removeLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
        onChange(JSON.stringify(newLinks));
    };

    return (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-white dark:bg-black">
            <h3 className="font-bold uppercase tracking-widest mb-4">{title}</h3>
            <div className="space-y-4">
                {links.map((link, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <input
                            className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm rounded w-1/3"
                            value={link.label}
                            onChange={(e) => updateLink(i, 'label', e.target.value)}
                            placeholder="Label"
                        />
                        <input
                            className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm rounded flex-1"
                            value={link.href}
                            onChange={(e) => updateLink(i, 'href', e.target.value)}
                            placeholder="URL"
                        />
                        <button onClick={() => removeLink(i)} className="text-red-500 hover:text-red-700 text-xs uppercase font-bold">Remove</button>
                    </div>
                ))}
            </div>
            <button onClick={addLink} className="mt-4 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">+ Add Link</button>
        </div>
    );
}

export default function AdminFooterPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Content State
    const [heroText, setHeroText] = useState("");
    const [ctaHeading, setCtaHeading] = useState("");
    const [ctaSubheading, setCtaSubheading] = useState("");

    // Link Lists (stored as JSON strings)
    const [col1Links, setCol1Links] = useState('[]'); // Brand/Legal
    const [col2Links, setCol2Links] = useState('[]'); // Navigation
    const [col3Links, setCol3Links] = useState('[]'); // Info

    useEffect(() => {
        const load = async () => {
            const [hText, cHead, cSub, c1, c2, c3] = await Promise.all([
                getContent("footer_hero_text", "Create Your\nOwn Unique\nLook"),
                getContent("footer_cta_heading", "Get in touch\nwith Vilksan"),
                getContent("footer_cta_subheading", "Contact us and our managers will be happy to answer all your questions."),
                getContent("footer_col_1_links", JSON.stringify([
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" }
                ])),
                getContent("footer_col_2_links", JSON.stringify([
                    { label: "Men", href: "/collections/men" },
                    { label: "Women", href: "/collections/women" },
                    { label: "Lookbook", href: "/collections/new-arrivals" },
                    { label: "About", href: "/about" }
                ])),
                getContent("footer_col_3_links", JSON.stringify([
                    { label: "Account", href: "/account" },
                    { label: "Help Center", href: "/help" },
                    { label: "Shipping & Payments", href: "/shipping" },
                    { label: "Contacts", href: "/contacts" }
                ]))
            ]);

            setHeroText(hText.value);
            setCtaHeading(cHead.value);
            setCtaSubheading(cSub.value);
            setCol1Links(c1.value);
            setCol2Links(c2.value);
            setCol3Links(c3.value);
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                saveContent("footer_hero_text", heroText),
                saveContent("footer_cta_heading", ctaHeading),
                saveContent("footer_cta_subheading", ctaSubheading),
                saveContent("footer_col_1_links", col1Links, "textarea"),
                saveContent("footer_col_2_links", col2Links, "textarea"),
                saveContent("footer_col_3_links", col3Links, "textarea"),
            ]);
            toast.success("Footer updated successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save footer");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold">Footer Management</h2>
                    <p className="text-neutral-500">Edit footer text and link columns.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Visual Text Editing Section */}
                <div className="space-y-8">
                    <h3 className="font-bold uppercase tracking-widest text-lg border-b border-neutral-200 dark:border-neutral-800 pb-4">
                        Header Texts
                    </h3>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">CTA Heading (Supports newlines)</label>
                        <textarea
                            value={ctaHeading}
                            onChange={(e) => setCtaHeading(e.target.value)}
                            className="w-full text-xl font-bold p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-transparent min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">CTA Subheading</label>
                        <textarea
                            value={ctaSubheading}
                            onChange={(e) => setCtaSubheading(e.target.value)}
                            className="w-full text-sm text-neutral-500 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-transparent min-h-[80px]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Hero Text (Right Side)</label>
                        <textarea
                            value={heroText}
                            onChange={(e) => setHeroText(e.target.value)}
                            className="w-full text-4xl font-black uppercase p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-black text-white min-h-[200px] leading-none"
                        />
                    </div>
                </div>

                {/* Link Lists Editing Section */}
                <div className="space-y-8">
                    <h3 className="font-bold uppercase tracking-widest text-lg border-b border-neutral-200 dark:border-neutral-800 pb-4">
                        Link Columns
                    </h3>

                    <LinkListEditor title="Column 1: Brand / Legal" linksJson={col1Links} onChange={setCol1Links} />
                    <LinkListEditor title="Column 2: Navigation" linksJson={col2Links} onChange={setCol2Links} />
                    <LinkListEditor title="Column 3: Info" linksJson={col3Links} onChange={setCol3Links} />
                </div>
            </div>
        </div>
    );
}
