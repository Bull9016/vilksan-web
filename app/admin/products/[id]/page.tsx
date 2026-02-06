
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getProduct, updateProduct, getCollections, type Collection } from "@/app/actions/product";
import { getCategories, type Category } from "@/app/actions/category";
import { getProductStats } from "@/app/actions/order";
import { uploadImage } from "@/app/actions/cloudinary";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Trash2, Upload, X, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [bgText, setBgText] = useState("");
    const [slug, setSlug] = useState("");
    const [featured, setFeatured] = useState(false);
    const [trending, setTrending] = useState(false);
    const [media, setMedia] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState("");
    const [selectedCollection, setSelectedCollection] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [productStyles, setProductStyles] = useState<{ bgText?: { x?: number, y?: number, fontSize?: number, color?: string, fontFamily?: string } }>({});

    // Rich Details
    const [details, setDetails] = useState("");
    const [fabricCare, setFabricCare] = useState("");
    const [shippingInfo, setShippingInfo] = useState("");

    // Variants
    const [variants, setVariants] = useState<{ id?: string, size: string, color: string, stock: number }[]>([]);
    const [newVariant, setNewVariant] = useState({ size: "", color: "", stock: 0 });

    // Analytics
    const [stats, setStats] = useState({ totalSold: 0, purchaseCount: 0 });

    useEffect(() => {
        const init = async () => {
            await Promise.all([loadProduct(), loadCollections(), loadCategories(), loadStats()]);
        };
        init();
    }, [id]);

    const loadStats = async () => {
        const data = await getProductStats(id);
        setStats(data);
    };

    const loadCollections = async () => {
        try {
            const data = await getCollections();
            setCollections(data);
        } catch (error) {
            console.error(error);
        }
    }

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    }

    const loadProduct = async () => {
        try {
            const product = await getProduct(id);
            if (!product) {
                toast.error("Product not found");
                router.push("/admin/products");
                return;
            }
            setTitle(product.title);
            setDescription(product.description || "");
            setPrice(product.price.toString());
            setStock(product.stock.toString());
            setBgText(product.bg_text || "");
            setSlug(product.slug || "");
            setFeatured(product.featured || false);
            setTrending(product.trending || false);
            setMedia(product.media || []);
            setCoverImage(product.cover_image || "");
            setSelectedCollection(product.collection_id || "");
            setSelectedCategory(product.category_id || "");
            setDetails(product.details || "");
            setFabricCare(product.fabric_care || "");
            setShippingInfo(product.shipping_info || "");
            setProductStyles(product.styles || {});

            if (product.variants) {
                setVariants(product.variants.map(v => ({
                    id: v.id,
                    size: v.size,
                    color: v.color,
                    stock: v.stock
                })));
            }

        } catch (error) {
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (files: FileList) => {
        setUploading(true);
        try {
            const newImages: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);
                formData.append("folder", "vilksan-products");

                const data = await uploadImage(formData);
                if (data.secure_url) {
                    newImages.push(data.secure_url);
                }
            }
            setMedia([...media, ...newImages]);
            toast.success(`${newImages.length} images uploaded`);
        } catch (e) {
            console.error(e);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCoverUpload = async (files: FileList) => {
        if (!files[0]) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", files[0]);
            formData.append("folder", "vilksan-products-cover");

            const data = await uploadImage(formData);
            if (data.secure_url) {
                setCoverImage(data.secure_url);
                toast.success("Cover image uploaded");
            }
        } catch (e) {
            console.error(e);
            toast.error("Cover upload failed");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        if (!newVariant.size || !newVariant.color) return;
        setVariants([...variants, newVariant]);
        setNewVariant({ size: "", color: "", stock: 0 });
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };


    const handleSave = async () => {
        if (!title || !price) {
            toast.error("Title and Price are required");
            return;
        }

        setSaving(true);
        try {
            await updateProduct(id, {
                title,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                bg_text: bgText,
                slug: slug || title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
                featured,
                trending,
                media,
                cover_image: coverImage || (media.length > 0 ? media[0] : undefined),
                collection_id: selectedCollection || undefined, // null for removing
                category_id: selectedCategory || undefined,
                details,
                fabric_care: fabricCare,
                shipping_info: shippingInfo,
                styles: productStyles,
                variants: variants.map(v => ({
                    ...v,
                    id: v.id || crypto.randomUUID(), // Preserve ID or generate new
                    product_id: id,
                    color_code: "#000000",
                    sku: `${title.substring(0, 3).toUpperCase()}-${v.size}-${v.color}`.toUpperCase(),
                }))
            });
            toast.success("Product updated successfully");
            router.push("/admin/products");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-display font-bold">Edit Product</h2>
                        <span className="text-neutral-500 text-sm">Update inventory details</span>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Section - New Request */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Total Sold</span>
                        <div className="text-2xl font-bold mt-1">{stats.totalSold}</div>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Purchases</span>
                        <div className="text-2xl font-bold mt-1">{stats.purchaseCount}</div>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Current Stock</span>
                        <div className="text-2xl font-bold mt-1">{stock}</div>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">Revenue (Est)</span>
                        <div className="text-2xl font-bold mt-1">₹{(stats.totalSold * parseFloat(price || "0")).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Product Title</label>
                            <input
                                type="text"
                                placeholder="E.g. Oversized Hoodie"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-2xl font-display font-bold bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-500">Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-500">Total Stock</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Short Description</label>
                            <textarea
                                rows={4}
                                placeholder="Product summary..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Rich Details */}
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                        <h3 className="font-medium mb-2">Detailed Information</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Full Details</label>
                            <textarea rows={3} value={details} onChange={e => setDetails(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none" placeholder="Extended description" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-500">Fabric & Care</label>
                                <textarea rows={3} value={fabricCare} onChange={e => setFabricCare(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none" placeholder="100% Cotton..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-500">Shipping Info</label>
                                <textarea rows={3} value={shippingInfo} onChange={e => setShippingInfo(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 outline-none" placeholder="Free shipping..." />
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                        <h3 className="font-medium mb-2">Variants (Size & Color)</h3>
                        <div className="flex gap-2 items-end">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-500">Size</label>
                                <input type="text" placeholder="S, M, L" value={newVariant.size} onChange={e => setNewVariant({ ...newVariant, size: e.target.value })} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm w-24" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-500">Color</label>
                                <input type="text" placeholder="Black, Red" value={newVariant.color} onChange={e => setNewVariant({ ...newVariant, color: e.target.value })} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm w-32" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-500">Stock</label>
                                <input type="number" placeholder="0" value={newVariant.stock} onChange={e => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm w-20" />
                            </div>
                            <button onClick={addVariant} className="bg-neutral-900 text-white dark:bg-white dark:text-black p-2 rounded-lg hover:opacity-80"><Plus size={18} /></button>
                        </div>

                        {variants.length > 0 && (
                            <div className="border rounded-lg divide-y dark:border-neutral-800 dark:divide-neutral-800 mt-4">
                                {variants.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 text-sm">
                                        <span>{v.size} / {v.color}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-neutral-500">Qty: {v.stock}</span>
                                            <button onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Media Upload */}
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                        <h3 className="font-medium mb-4 flex items-center gap-2">
                            <ImageIcon size={18} /> Product Images
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Cover Image Slot */}
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 group bg-neutral-50 dark:bg-neutral-900">
                                {coverImage ? (
                                    <>
                                        <Image src={coverImage} alt="Cover" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Cover</span>
                                        </div>
                                        <button
                                            onClick={() => setCoverImage("")}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                        {uploading ? (
                                            <Loader2 className="animate-spin text-neutral-400" />
                                        ) : (
                                            <>
                                                <Upload className="text-neutral-400 mb-2" />
                                                <span className="text-xs text-neutral-500 text-center px-1">Upload Cover</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => e.target.files && handleCoverUpload(e.target.files)}
                                        />
                                    </label>
                                )}
                            </div>

                            {media.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                                    <Image src={url} alt={`Product ${idx}`} fill className="object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-neutral-50 dark:bg-neutral-900/50">
                                {uploading ? (
                                    <Loader2 className="animate-spin text-neutral-400" />
                                ) : (
                                    <>
                                        <Upload className="text-neutral-400 mb-2" />
                                        <span className="text-xs text-neutral-500 text-center px-2">Upload Images</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                        <h3 className="font-medium">Organization</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Collection</label>
                            <select
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none"
                            >
                                <option value="">None</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none"
                            >
                                <option value="">None</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Slug (URL)</label>
                            <input
                                type="text"
                                placeholder="my-product-name"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                            <p className="text-xs text-neutral-400">Leave blank to auto-generate.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-neutral-500">Background Text</label>
                            <input
                                type="text"
                                placeholder="Ex: LIMITED"
                                value={bgText}
                                onChange={(e) => setBgText(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none font-display font-bold uppercase mb-4"
                            />

                            {/* Background Text Styles */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
                                <span className="text-xs font-bold uppercase text-neutral-500">Background Style</span>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Font Family</label>
                                        <select
                                            value={productStyles.bgText?.fontFamily || 'var(--font-inter)'}
                                            onChange={(e) => setProductStyles({ ...productStyles, bgText: { ...productStyles.bgText, fontFamily: e.target.value } })}
                                            className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-xs outline-none h-8"
                                        >
                                            <option value="var(--font-inter)">Inter (Default)</option>
                                            <option value="var(--font-oswald)">Oswald (Condensed)</option>
                                            <option value="var(--font-playfair)">Playfair (Serif)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="w-full h-8 cursor-pointer rounded overflow-hidden"
                                                value={productStyles.bgText?.color || '#000000'}
                                                onChange={(e) => setProductStyles({ ...productStyles, bgText: { ...productStyles.bgText, color: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Size (px)</label>
                                        <input
                                            type="number"
                                            placeholder="Auto"
                                            className="w-full text-xs px-2 py-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded outline-none"
                                            value={productStyles.bgText?.fontSize || ''}
                                            onChange={(e) => setProductStyles({ ...productStyles, bgText: { ...productStyles.bgText, fontSize: parseInt(e.target.value) || undefined } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">X Pos</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full text-xs px-2 py-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded outline-none"
                                            value={productStyles.bgText?.x || ''}
                                            onChange={(e) => setProductStyles({ ...productStyles, bgText: { ...productStyles.bgText, x: parseInt(e.target.value) || 0 } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Y Pos</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full text-xs px-2 py-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded outline-none"
                                            value={productStyles.bgText?.y || ''}
                                            onChange={(e) => setProductStyles({ ...productStyles, bgText: { ...productStyles.bgText, y: parseInt(e.target.value) || 0 } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={featured}
                                    onChange={(e) => setFeatured(e.target.checked)}
                                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium">Featured Product</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={trending}
                                    onChange={(e) => setTrending(e.target.checked)}
                                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium">Trending Product</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
