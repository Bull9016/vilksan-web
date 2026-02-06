"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { addAddress, type Address, deleteAddress, setDefaultAddress } from "@/app/actions/user";
import { Loader2, Plus, Trash2, CheckCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddressForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            await addAddress(data);
            toast.success("Address added successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to add address");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-lg mb-4">Add Shipping Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <input {...register("full_name", { required: true })} placeholder="Full Name" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.full_name && <span className="text-red-500 text-xs">Required</span>}
                </div>
                <div className="space-y-1">
                    <input {...register("phone", { required: true })} placeholder="Phone Number" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.phone && <span className="text-red-500 text-xs">Required</span>}
                </div>
            </div>

            <div className="space-y-1">
                <input {...register("line1", { required: true })} placeholder="Address Line 1" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                {errors.line1 && <span className="text-red-500 text-xs">Required</span>}
            </div>

            <div className="space-y-1">
                <input {...register("line2")} placeholder="Apartment, suite, etc. (optional)" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <input {...register("city", { required: true })} placeholder="City" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.city && <span className="text-red-500 text-xs">Required</span>}
                </div>
                <div className="space-y-1">
                    <input {...register("state", { required: true })} placeholder="State" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.state && <span className="text-red-500 text-xs">Required</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <input {...register("zip", { required: true })} placeholder="ZIP / Postal Code" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.zip && <span className="text-red-500 text-xs">Required</span>}
                </div>
                <div className="space-y-1">
                    <input {...register("country", { required: true })} placeholder="Country" className="w-full p-2 rounded border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700" />
                    {errors.country && <span className="text-red-500 text-xs">Required</span>}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded hover:opacity-80 disabled:opacity-50 flex items-center justify-center">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Address"}
                </button>
            </div>
        </form>
    );
}

export function AddressSelector({
    addresses,
    selectedId,
    onSelect
}: {
    addresses: Address[],
    selectedId: string | null,
    onSelect: (id: string) => void
}) {
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this address?")) return;
        try {
            await deleteAddress(id);
            toast.success("Address deleted");
        } catch (e) { toast.error("Failed to delete") }
    };

    return (
        <div className="space-y-4">
            {isAdding ? (
                <AddressForm onSuccess={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
            ) : (
                <>
                    <h2 className="font-display text-xl font-bold uppercase tracking-widest mb-6">Shipping Address</h2>

                    <div className="space-y-3">
                        {addresses.map(addr => (
                            <div
                                key={addr.id}
                                onClick={() => onSelect(addr.id)}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-neutral-300 dark:hover:border-neutral-700 flex items-start gap-3",
                                    selectedId === addr.id
                                        ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-900"
                                        : "border-transparent bg-white dark:bg-black shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center mt-0.5",
                                    selectedId === addr.id ? "bg-black dark:bg-white border-black dark:border-white" : ""
                                )}>
                                    {selectedId === addr.id && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm">{addr.full_name} <span className="text-neutral-500 font-normal ml-2">{addr.phone}</span></p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                                                {addr.line1}, {addr.line2 && `${addr.line2}, `}
                                            </p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                {addr.city}, {addr.state} {addr.zip}, {addr.country}
                                            </p>
                                        </div>
                                        <button onClick={(e) => handleDelete(e, addr.id)} className="text-neutral-400 hover:text-red-500 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest"
                        >
                            <Plus size={16} /> Add New Address
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

