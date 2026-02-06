"use client";

import { useState, useEffect } from "react";
import { getContent, saveContent, getGridItems, updateGridItem, type GridItem } from "@/app/actions/content";
import { uploadImage } from "@/app/actions/cloudinary";
import { getCollections } from "@/app/actions/product";
import { Upload, Save, Loader2, Plus, Trash2, ChevronLeft, ChevronRight, Layers, ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---

interface HeroSlide {
    id: string;
    bgText: string;
    badge: string;
    subline: string;
    image: string;
    textPosition: "behind" | "front" | "over";
    duration: number; // in seconds
    styles: {
        bgText?: any;
        badge?: any;
        subline?: any;
        image?: any;
    };
}

// Define the standard (non-hero) fields we want to manage
const CONTENT_FIELDS = [
    { key: "site_logo", label: "Site Logo (Top Left)", type: "image" },

    // Collection Section
    { key: "home_collection_title", label: "Collection Title", type: "text" },
    { key: "home_collection_desc", label: "Collection Description", type: "textarea" },
    { key: "home_collection_cta_link", label: "Shop Now Button Value (Select Collection)", type: "collection_select" },
    { key: "home_collection_image", label: "Collection Image (Right)", type: "image" },

    // Philosophy Section
    { key: "home_philosophy_title", label: "Philosophy Title", type: "text" },
    { key: "home_philosophy_text", label: "Philosophy Text", type: "textarea" },
    { key: "home_philosophy_image", label: "Philosophy Image (Right)", type: "image" },

    // Editorial Section
    { key: "home_editorial_title", label: "Editorial Title", type: "text" },
    { key: "home_editorial_text", label: "Editorial Text", type: "textarea" },
    { key: "home_editorial_image", label: "Editorial Image (Left)", type: "image" },

    // Newsletter Section
    { key: "home_newsletter_title", label: "Newsletter Title", type: "text" },
    { key: "home_newsletter_desc", label: "Newsletter Description", type: "textarea" },
];

const DEFAULT_SLIDE: HeroSlide = {
    id: "default",
    bgText: "VILKSAN",
    badge: "New Collection",
    subline: "Explore our latest arrivals.",
    image: "",
    textPosition: "behind",
    duration: 5,
    styles: {}
};

export default function AdminContent() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [data, setData] = useState<Record<string, string>>({});
    const [styles, setStyles] = useState<Record<string, any>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    // Featured Categories State
    const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
    const [availableCollections, setAvailableCollections] = useState<any[]>([]);

    const [gridItems, setGridItems] = useState<GridItem[]>([]);

    // Carousel State
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Dropdown Options
    const [collectionOptions, setCollectionOptions] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // ... existing data fetching ...
            const newData: Record<string, string> = {};
            const newStyles: Record<string, any> = {};

            // 1. Fetch Standard Fields
            await Promise.all(CONTENT_FIELDS.map(async (field) => {
                const res = await getContent(field.key);
                newData[field.key] = typeof res === 'object' ? res.value : res;
                newStyles[field.key] = typeof res === 'object' ? res.style : {};
            }));

            // 2. Fetch Carousel Data
            const slidesRes = await getContent("home_hero_slides");
            let fetchedSlides: HeroSlide[] = [];

            if (slidesRes && slidesRes.value) {
                try {
                    fetchedSlides = JSON.parse(slidesRes.value);
                } catch (e) {
                    console.error("Failed to parse slides JSON", e);
                }
            } else {
                // Fallback migration logic (omitted for brevity, assume handled or clean slate)
                fetchedSlides.push({ ...DEFAULT_SLIDE, id: crypto.randomUUID() });
            }

            setSlides(fetchedSlides);

            // 3. Fetch Featured Categories
            const featCatRes = await getContent("home_featured_categories");
            if (featCatRes && featCatRes.value) {
                try {
                    setFeaturedCategories(JSON.parse(featCatRes.value));
                } catch (e) {
                    setFeaturedCategories([]);
                }
            }

            // 4. Fetch Grid Items
            const gridRes = await getGridItems();
            setGridItems(gridRes);

            // Fetch Collections for dropdown
            try {
                const collections = await getCollections();
                setAvailableCollections(collections);
                setCollectionOptions(collections.map(c => ({ label: c.title, value: `/collections/${c.slug}` })));
            } catch (err) {
                console.error("Failed to fetch collections", err);
            }

            setData(newData);
            setStyles(newStyles);
            setLoading(false);
        };
        fetchData();
    }, []);

    // --- Standard Field Handlers ---

    const handleSave = async (key: string, value: string, type: "text" | "image" | "select" | "textarea" = "text") => {
        setSaving(key);
        try {
            await saveContent(key, value, type, styles[key]);
            toast.success("Saved successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save content");
        } finally {
            setSaving(null);
        }
    };

    const handleImageUpload = async (key: string, file: File) => {
        setUploading(key);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "vilksan-uploads");

            const res = await uploadImage(formData);

            if (res.error) {
                toast.error(`Upload failed: ${res.error}`);
                return;
            }

            if (res.secure_url) {
                const url = res.secure_url;
                setData(prev => ({ ...prev, [key]: url }));
                await handleSave(key, url, "image");
            }
        } catch (e) {
            console.error(e);
            toast.error("Upload failed");
        } finally {
            setUploading(null);
        }
    };

    // --- Carousel Handlers ---

    const saveSlides = async (updatedSlides: HeroSlide[]) => {
        setSlides(updatedSlides);
        // Persist immediately (or could be explicit save button, but immediate is usually better for complex forms)
        // actually, let's just update local state and use a "Save Carousel" button for the whole block
        // to avoid too many writes/re-renders while typing.
    };

    const handleCarouselSave = async () => {
        setSaving("carousel");
        try {
            await saveContent("home_hero_slides", JSON.stringify(slides), "text", {});
            toast.success("Carousel saved successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save carousel");
        } finally {
            setSaving(null);
        }
    };

    const updateSlide = (index: number, updates: Partial<HeroSlide>) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], ...updates };
        setSlides(newSlides);
    };

    const updateSlideStyle = (index: number, element: keyof HeroSlide['styles'], styleUpdate: any) => {
        const newSlides = [...slides];
        const currentStyles = newSlides[index].styles[element] || {};
        newSlides[index].styles = {
            ...newSlides[index].styles,
            [element]: { ...currentStyles, ...styleUpdate }
        };
        setSlides(newSlides);
    };

    const handleSlideImageUpload = async (index: number, file: File) => {
        setUploading(`slide-${index}`);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "vilksan-uploads");
            const res = await uploadImage(formData);

            if (res.secure_url) {
                updateSlide(index, { image: res.secure_url });
                toast.success("Image uploaded (Save Carousel to persist)");
            }
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setUploading(null);
        }
    };

    const addSlide = () => {
        const newSlide = { ...DEFAULT_SLIDE, id: crypto.randomUUID() };
        setSlides([...slides, newSlide]);
        setCurrentSlideIndex(slides.length); // Jump to new slide
    };

    const removeSlide = (index: number) => {
        if (slides.length <= 1) {
            toast.error("Must have at least one slide");
            return;
        }
        if (confirm("Delete this slide?")) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            if (currentSlideIndex >= newSlides.length) {
                setCurrentSlideIndex(newSlides.length - 1);
            }
        }
    };

    const moveSlide = (direction: 'left' | 'right') => {
        if (direction === 'left' && currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        } else if (direction === 'right' && currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    // --- Featured Categories Handlers ---

    const saveFeaturedCategories = async (newCats: string[]) => {
        setFeaturedCategories(newCats);
        setSaving("categories");
        try {
            await saveContent("home_featured_categories", JSON.stringify(newCats), "text", {});
            toast.success("Categories updated");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save categories");
        } finally {
            setSaving(null);
        }
    };

    const addFeaturedCategory = (collectionId: string) => {
        if (!collectionId) return;
        if (featuredCategories.includes(collectionId)) {
            toast.error("Category already added");
            return;
        }
        saveFeaturedCategories([...featuredCategories, collectionId]);
    };

    const removeFeaturedCategory = (collectionId: string) => {
        saveFeaturedCategories(featuredCategories.filter(id => id !== collectionId));
    };

    const moveFeaturedCategory = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === featuredCategories.length - 1) return;

        const newCats = [...featuredCategories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newCats[index], newCats[swapIndex]] = [newCats[swapIndex], newCats[index]];
        saveFeaturedCategories(newCats);
    };

    // --- Grid Handlers ---

    const handleGridUpdate = (id: string, updates: Partial<GridItem>) => {
        const newItems = gridItems.map(item => item.id === id ? { ...item, ...updates } : item);
        setGridItems(newItems);
    };

    const handleGridSave = async (id: string) => {
        const item = gridItems.find(i => i.id === id);
        if (!item) return;

        setSaving(`grid-${id}`);
        try {
            const { id: _, ...updates } = item;
            await updateGridItem(id, updates);
            toast.success("Block saved successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save block");
        } finally {
            setSaving(null);
        }
    };

    const handleGridImageUpload = async (id: string, file: File) => {
        setUploading(`grid-${id}`);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "vilksan-uploads");
            const res = await uploadImage(formData);
            if (res.secure_url) {
                // Update local state
                const newItems = gridItems.map(item => item.id === id ? { ...item, image_url: res.secure_url! } : item);
                setGridItems(newItems);

                // Persist image immediately
                await updateGridItem(id, { image_url: res.secure_url! });
                toast.success("Image uploaded");
            }
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setUploading(null);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const currentSlide = slides[currentSlideIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div>
                <h2 className="text-3xl font-display font-bold">Site Content</h2>
                <p className="text-neutral-500">Manage global website text, images, and the hero carousel.</p>
            </div>

            {/* --- HERO CAROUSEL SECTION --- */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest">Hero Carousel</h3>
                        <p className="text-sm text-neutral-500">Manage rotating banner slides.</p>
                    </div>
                    <button
                        onClick={handleCarouselSave}
                        disabled={saving === "carousel"}
                        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        {saving === "carousel" ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Carousel
                    </button>
                </div>

                {/* Navigation Bar */}
                <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => moveSlide('left')}
                            disabled={currentSlideIndex === 0}
                            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-mono text-sm font-bold">
                            Slide {currentSlideIndex + 1} of {slides.length}
                        </span>
                        <button
                            onClick={() => moveSlide('right')}
                            disabled={currentSlideIndex === slides.length - 1}
                            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => removeSlide(currentSlideIndex)}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold uppercase transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                        <button
                            onClick={addSlide}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg text-xs font-bold uppercase transition-colors"
                        >
                            <Plus size={14} />
                            Add Slide
                        </button>
                    </div>
                </div>

                {/* Active Slide Editor */}
                {currentSlide && (
                    <div className="p-6 space-y-8">
                        {/* 1. Main Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Duration */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Duration (Seconds)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={currentSlide.duration}
                                    onChange={(e) => updateSlide(currentSlideIndex, { duration: parseInt(e.target.value) || 5 })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none"
                                />
                            </div>

                            {/* Text Position */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Text Layering
                                </label>
                                <select
                                    value={currentSlide.textPosition}
                                    onChange={(e) => updateSlide(currentSlideIndex, { textPosition: e.target.value as any })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none"
                                >
                                    <option value="behind">Text Behind Image</option>
                                    <option value="front">Text Over Image</option>
                                    <option value="over">Text Over Image (Legacy)</option>
                                </select>
                            </div>
                        </div>

                        {/* 2. Content Fields */}
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                                    <Layers size={14} /> Main Image
                                </label>
                                <div className="flex gap-6 items-start">
                                    <div className="relative w-40 h-40 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-800">
                                        {currentSlide.image ? (
                                            <Image src={currentSlide.image} alt="Slide Main" fill className="object-contain" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-neutral-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                                            <Upload size={16} />
                                            <span className="text-sm font-medium">{uploading === `slide-${currentSlideIndex}` ? "Uploading..." : "Upload New Image"}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSlideImageUpload(currentSlideIndex, e.target.files[0])} />
                                        </label>

                                        {/* Image Styles */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {['width', 'tilt', 'x', 'y'].map(attr => (
                                                <div key={attr}>
                                                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">{attr}</label>
                                                    <input
                                                        type={attr === 'width' ? 'text' : 'number'}
                                                        placeholder={attr === 'width' ? '%' : 'px'}
                                                        value={currentSlide.styles.image?.[attr] || ''}
                                                        onChange={(e) => updateSlideStyle(currentSlideIndex, 'image', { [attr]: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Text */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Big Background Text</label>
                                <input
                                    type="text"
                                    value={currentSlide.bgText}
                                    onChange={(e) => updateSlide(currentSlideIndex, { bgText: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 font-display text-xl font-bold tracking-tighter mb-4"
                                />
                                <div className="space-y-4">
                                    {/* Styles for Bg Text */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {['fontSize', 'tilt', 'x', 'y', 'color'].map(attr => (
                                            <div key={attr}>
                                                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">{attr}</label>
                                                {attr === 'color' ? (
                                                    <input
                                                        type="color"
                                                        value={currentSlide.styles.bgText?.color || "#000000"}
                                                        onChange={(e) => updateSlideStyle(currentSlideIndex, 'bgText', { color: e.target.value })}
                                                        className="w-full h-8 cursor-pointer"
                                                    />
                                                ) : (
                                                    <input
                                                        type={attr === 'fontSize' ? 'text' : 'number'}
                                                        value={currentSlide.styles.bgText?.[attr] || ''}
                                                        onChange={(e) => updateSlideStyle(currentSlideIndex, 'bgText', { [attr]: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Font Selection */}
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Font Family</label>
                                        <select
                                            value={currentSlide.styles.bgText?.fontFamily || 'var(--font-inter)'}
                                            onChange={(e) => updateSlideStyle(currentSlideIndex, 'bgText', { fontFamily: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                        >
                                            <option value="var(--font-inter)">Inter (Modern)</option>
                                            <option value="var(--font-playfair)">Playfair Display (Elegant)</option>
                                            <option value="var(--font-oswald)">Oswald (Bold Condensed)</option>
                                            <option value="var(--font-courier)">Courier Prime (Mono)</option>
                                            <option value="var(--font-cinzel)">Cinzel (Luxury)</option>
                                            <option value="var(--font-montserrat)">Montserrat (Geometric)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Subline & Badge */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Small Badge Controls */}
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Small Badge</label>
                                    <input
                                        type="text"
                                        value={currentSlide.badge}
                                        onChange={(e) => updateSlide(currentSlideIndex, { badge: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm mb-2 font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Color</label>
                                            <input type="color" className="w-full h-8 cursor-pointer" value={currentSlide.styles.badge?.color || '#000000'} onChange={e => updateSlideStyle(currentSlideIndex, 'badge', { color: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Layer</label>
                                            <select
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none h-8"
                                                value={currentSlide.styles.badge?.layer || 'front'}
                                                onChange={e => updateSlideStyle(currentSlideIndex, 'badge', { layer: e.target.value })}
                                            >
                                                <option value="front">Front (Overlay)</option>
                                                <option value="behind">Back (Behind Image)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['fontSize', 'x', 'y'].map(attr => (
                                            <div key={attr}>
                                                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">{attr === 'fontSize' ? 'Size' : attr}</label>
                                                <input
                                                    type="number"
                                                    placeholder={attr === 'fontSize' ? 'px' : 'px'}
                                                    className="w-full text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border rounded"
                                                    value={currentSlide.styles.badge?.[attr] || ''}
                                                    onChange={e => updateSlideStyle(currentSlideIndex, 'badge', { [attr]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Subline Controls */}
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Subline (Main Text)</label>
                                    <textarea
                                        rows={2}
                                        value={currentSlide.subline}
                                        onChange={(e) => updateSlide(currentSlideIndex, { subline: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-xs mb-2 font-display font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Color</label>
                                            <input type="color" className="w-full h-8 cursor-pointer" value={currentSlide.styles.subline?.color || '#000000'} onChange={e => updateSlideStyle(currentSlideIndex, 'subline', { color: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Layer</label>
                                            <select
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none h-8"
                                                value={currentSlide.styles.subline?.layer || 'front'}
                                                onChange={e => updateSlideStyle(currentSlideIndex, 'subline', { layer: e.target.value })}
                                            >
                                                <option value="front">Front (Overlay)</option>
                                                <option value="behind">Back (Behind Image)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['fontSize', 'x', 'y'].map(attr => (
                                            <div key={attr}>
                                                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">{attr === 'fontSize' ? 'Size' : attr}</label>
                                                <input
                                                    type="number"
                                                    placeholder={attr === 'fontSize' ? 'px' : 'px'}
                                                    className="w-full text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border rounded"
                                                    value={currentSlide.styles.subline?.[attr] || ''}
                                                    onChange={e => updateSlideStyle(currentSlideIndex, 'subline', { [attr]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* --- FEATURED CATEGORIES SECTION --- */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-lg font-bold uppercase tracking-widest">Featured Categories</h3>
                    <p className="text-sm text-neutral-500">Select collections to display in the showcase carousel.</p>
                </div>
                <div className="p-6 space-y-6">
                    {/* Add Category */}
                    <div className="flex gap-4">
                        <select
                            className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none cursor-pointer"
                            onChange={(e) => {
                                if (e.target.value) {
                                    addFeaturedCategory(e.target.value);
                                    e.target.value = ""; // Reset
                                }
                            }}
                        >
                            <option value="">+ Add Category to Showcase</option>
                            {availableCollections.map(c => (
                                <option key={c.id} value={c.id} disabled={featuredCategories.includes(c.id)}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {featuredCategories.map((catId, index) => {
                            const collection = availableCollections.find(c => c.id === catId);
                            if (!collection) return null;
                            return (
                                <div key={catId} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                    <span className="font-bold">{collection.title}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => moveFeaturedCategory(index, 'up')} disabled={index === 0} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded disabled:opacity-30">
                                            <ArrowUp size={16} />
                                        </button>
                                        <button onClick={() => moveFeaturedCategory(index, 'down')} disabled={index === featuredCategories.length - 1} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded disabled:opacity-30">
                                            <ArrowDown size={16} />
                                        </button>
                                        <button onClick={() => removeFeaturedCategory(catId)} className="p-1 text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded ml-2">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {featuredCategories.length === 0 && (
                            <div className="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                                No categories selected. Add one to start.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- FEATURED GRID SECTION --- */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid size={20} /> Featured Grid
                    </h3>
                    <p className="text-sm text-neutral-500">Manage the 4-block featured grid on the home page.</p>
                </div>
                <div className="p-6 space-y-8">
                    {gridItems.map((item) => (
                        <div key={item.id} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-4">
                                {item.position === 1 ? "Large (Top)" : `Small Block ${item.position - 1}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Upload */}
                                <div>
                                    <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-2">
                                        {item.image_url ? (
                                            <Image src={item.image_url} alt="Grid Item" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-neutral-400">No Image</div>
                                        )}
                                    </div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors w-full justify-center">
                                        <Upload size={14} />
                                        <span className="text-xs font-bold uppercase">{uploading === `grid-${item.id}` ? "..." : "Upload Image"}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleGridImageUpload(item.id, e.target.files[0])} />
                                    </label>
                                </div>

                                {/* Text Fields */}
                                <div className="space-y-3">
                                    {item.position === 1 && (
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-neutral-400">Subtitle</label>
                                            <input
                                                type="text"
                                                value={item.subtitle || ""}
                                                onChange={(e) => handleGridUpdate(item.id, { subtitle: e.target.value })}
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Title</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => handleGridUpdate(item.id, { title: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Description</label>
                                        <textarea
                                            rows={2}
                                            value={item.description}
                                            onChange={(e) => handleGridUpdate(item.id, { description: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-neutral-400">Link Text</label>
                                            <input
                                                type="text"
                                                value={item.link_text}
                                                onChange={(e) => handleGridUpdate(item.id, { link_text: e.target.value })}
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-neutral-400">Link URL</label>
                                            <input
                                                type="text"
                                                value={item.link_url}
                                                onChange={(e) => handleGridUpdate(item.id, { link_url: e.target.value })}
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Text Color</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleGridUpdate(item.id, { text_color: 'black' })}
                                                className={cn(
                                                    "px-3 py-1 rounded text-xs border",
                                                    item.text_color === 'black' ? "bg-black text-white border-black" : "bg-white text-black border-neutral-200"
                                                )}
                                            >
                                                Black
                                            </button>
                                            <button
                                                onClick={() => handleGridUpdate(item.id, { text_color: 'white' })}
                                                className={cn(
                                                    "px-3 py-1 rounded text-xs border",
                                                    item.text_color === 'white' ? "bg-neutral-500 text-white border-neutral-500" : "bg-white text-black border-neutral-200"
                                                )}
                                            >
                                                White
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4 border-t border-neutral-100 dark:border-neutral-900 pt-4">
                                <button
                                    onClick={() => handleGridSave(item.id)}
                                    disabled={saving === `grid-${item.id}`}
                                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {saving === `grid-${item.id}` ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Block
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {CONTENT_FIELDS.map((field) => (
                    <div key={field.key} className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl">
                        <label className="block text-sm font-medium uppercase tracking-widest text-neutral-500 mb-3">
                            {field.label}
                        </label>

                        <div className="flex gap-4 items-start">
                            {/* Inputs similar to before... */}
                            {field.type === "text" && (
                                <input
                                    type="text"
                                    value={data[field.key] || ""}
                                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                                    className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                />
                            )}
                            {/* Select Input */}
                            {(field.type === "collection_select") && (
                                <select
                                    value={data[field.key] || ""}
                                    onChange={(e) => {
                                        const newVal = e.target.value;
                                        setData({ ...data, [field.key]: newVal });
                                        handleSave(field.key, newVal, "select");
                                    }}
                                    className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none cursor-pointer"
                                >
                                    <option value="">Select a collection...</option>
                                    {collectionOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {field.type === "textarea" && (
                                <textarea
                                    rows={3}
                                    value={data[field.key] || ""}
                                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                                    className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                />
                            )}

                            {field.type === "image" && (
                                <div className="flex-1 space-y-4">
                                    <div className="relative w-full aspect-video md:w-60 md:h-40 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                                        {data[field.key] ? (
                                            <Image src={data[field.key]} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <span className="text-xs text-neutral-400 uppercase tracking-widest">No Image Set</span>
                                        )}
                                    </div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                                        <Upload size={16} />
                                        <span className="text-sm font-medium">{uploading === field.key ? "Uploading..." : "Upload"}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(field.key, e.target.files[0])} />
                                    </label>
                                </div>
                            )}

                            {/* Save Button */}
                            {(field.type === "text" || field.type === "textarea") && (
                                <button
                                    onClick={() => handleSave(field.key, data[field.key] || "")}
                                    disabled={saving === field.key}
                                    className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {saving === field.key ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
