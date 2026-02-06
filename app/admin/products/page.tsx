"use client";

import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Loader2, Star, TrendingUp } from "lucide-react";
import { getProducts, deleteProduct, type Product } from "@/app/actions/product";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold">Products</h2>
                    <p className="text-neutral-500">Manage your inventory.</p>
                </div>
                <Link href="/admin/products/new">
                    <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        <Plus size={18} />
                        New Product
                    </button>
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">No products yet. Add your first item.</div>
            ) : (
                <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                            <tr>
                                <th className="p-4 font-medium text-sm text-neutral-500">Product</th>
                                <th className="p-4 font-medium text-sm text-neutral-500">Price</th>
                                <th className="p-4 font-medium text-sm text-neutral-500">Stock</th>
                                <th className="p-4 font-medium text-sm text-neutral-500">Status</th>
                                <th className="p-4 font-medium text-sm text-neutral-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {products.map((product) => (
                                <tr key={product.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                                {(product.cover_image || (product.media && product.media[0])) && (
                                                    <Image src={product.cover_image || product.media[0]} alt={product.title} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{product.title}</div>
                                                <div className="flex gap-2 mt-1">
                                                    {product.featured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded flex items-center gap-1"><Star size={8} fill="currentColor" /> Featured</span>}
                                                    {product.trending && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded flex items-center gap-1"><TrendingUp size={8} /> Trending</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">₹{product.price}</td>
                                    <td className="p-4">{product.stock}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
