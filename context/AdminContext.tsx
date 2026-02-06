"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
    isEditing: boolean;
    toggleEditMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEditMode = () => setIsEditing((prev) => !prev);

    return (
        <AdminContext.Provider value={{ isEditing, toggleEditMode }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
