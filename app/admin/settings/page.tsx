"use client";

import { Save } from "lucide-react";

export default function AdminSettings() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-display font-bold">Settings</h2>
                <p className="text-neutral-500">Manage global application settings.</p>
            </div>

            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">General</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">Store Name</label>
                            <input
                                type="text"
                                defaultValue="Vilksan"
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-500 mb-1">Contact Email</label>
                            <input
                                type="email"
                                defaultValue="admin@vilksan.com"
                                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2"
                                disabled
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
