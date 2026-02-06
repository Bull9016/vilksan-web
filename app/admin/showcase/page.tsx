"use client";

import { useEffect, useState } from "react";
import { getContent, saveContent } from "@/app/actions/content";
import { getCollections, type Collection } from "@/app/actions/product";
import { getCategories, type Category } from "@/app/actions/category";
import { Loader2, Save, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ShowcaseMode = "collections" | "categories";

export default function AdminShowcasePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [mode, setMode] = useState<ShowcaseMode>("collections");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Available Options
    const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch everything in parallel
            const [
                modeContent,
                idsContent,
                collectionsData,
                categoriesData
            ] = await Promise.all([
                getContent("home_showcase_mode"),
                getContent("home_featured_categories"), // Legacy key, reusing for list of IDs
                getCollections(),
                getCategories()
            ]);

            setMode((modeContent?.value as ShowcaseMode) || "collections");

            if (idsContent?.value) {
                try {
                    setSelectedIds(JSON.parse(idsContent.value));
                } catch (e) {
                    setSelectedIds([]);
                }
            }

            setAvailableCollections(collectionsData);
            setAvailableCategories(categoriesData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load showcase data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save both mode and the list of IDs
            await Promise.all([
                saveContent("home_showcase_mode", mode, "text"),
                saveContent("home_featured_categories", JSON.stringify(selectedIds), "text")
            ]);
            toast.success("Showcase updated successfully");
        } catch (error) {
            toast.error("Failed to update showcase");
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = (id: string) => {
        if (!selectedIds.includes(id)) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleRemoveItem = (id: string) => {
        setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === selectedIds.length - 1) return;

        const newIds = [...selectedIds];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];
        setSelectedIds(newIds);
    };

    // Helper to get title based on ID
    const getItemTitle = (id: string) => {
        if (mode === "collections") {
            return availableCollections.find(c => c.id === id)?.title || "Unknown Collection";
        } else {
            return availableCategories.find(c => c.id === id)?.title || "Unknown Category";
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const availableItems = mode === "collections" ? availableCollections : availableCategories;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-display font-bold">Home Showcase</h2>
                    <p className="text-neutral-500 text-sm">Manage the "Shop by Category" section on the home page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. Configuration Panel */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Display Mode</label>
                        <div className="space-y-3">
                            <label className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                mode === "collections"
                                    ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-900"
                                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            )}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="collections"
                                    checked={mode === "collections"}
                                    onChange={() => {
                                        if (confirm("Switching modes will clear your current selection. Continue?")) {
                                            setMode("collections");
                                            setSelectedIds([]);
                                        }
                                    }}
                                    className="accent-black dark:accent-white"
                                />
                                <span className="font-medium text-sm">Collections</span>
                            </label>

                            <label className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                mode === "categories"
                                    ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-900"
                                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            )}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="categories"
                                    checked={mode === "categories"}
                                    onChange={() => {
                                        if (confirm("Switching modes will clear your current selection. Continue?")) {
                                            setMode("categories");
                                            setSelectedIds([]);
                                        }
                                    }}
                                    className="accent-black dark:accent-white"
                                />
                                <span className="font-medium text-sm">Categories (New)</span>
                            </label>
                        </div>
                        <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                            <strong>Collections</strong> are for specific product drops (e.g., "Holiday 2025").<br />
                            <strong>Categories</strong> are for broad product types (e.g., "T-Shirts", "Accessories").
                        </p>
                    </div>

                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Add {mode === "collections" ? "Collection" : "Category"}</label>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddItem(e.target.value);
                                        e.target.value = "";
                                    }
                                }}
                            >
                                <option value="">Select an item...</option>
                                {availableItems.filter(item => !selectedIds.includes(item.id)).map(item => (
                                    <option key={item.id} value={item.id}>{item.title}</option>
                                ))}
                            </select>
                        </div>
                        {availableItems.length === 0 && (
                            <p className="text-xs text-red-500 mt-2">No items found. Create some {mode} first.</p>
                        )}
                    </div>
                </div>

                {/* 2. Selection List */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase tracking-widest">Selected Items</h3>
                            <span className="text-xs text-neutral-500">{selectedIds.length} items</span>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {selectedIds.length === 0 ? (
                                <div className="p-12 text-center text-neutral-400 text-sm">
                                    No items selected. Add items from the panel on the left.
                                </div>
                            ) : (
                                selectedIds.map((id, index) => (
                                    <div key={id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-xs text-neutral-400 w-6">{(index + 1).toString().padStart(2, '0')}</span>
                                            <span className="font-medium">{getItemTitle(id)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleMoveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg disabled:opacity-30"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleMoveItem(index, 'down')}
                                                disabled={index === selectedIds.length - 1}
                                                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg disabled:opacity-30"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-2" />
                                            <button
                                                onClick={() => handleRemoveItem(id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
