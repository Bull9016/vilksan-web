
// --- Grid Item Handlers ---

const handleGridUpdate = async (id: string, updates: Partial<GridItem>) => {
    const newItems = gridItems.map(item => item.id === id ? { ...item, ...updates } : item);
    setGridItems(newItems);
    // Debounce or immediate save? Let's do save on explicit action for images, but maybe auto for text?
    // For simplicity reusing the same pattern: local state update + separate save or immediate individual field save.
    // Let's do immediate save for this section to avoid global save confusion.
    try {
        await updateGridItem(id, updates);
        toast.success("Updated");
    } catch (e) {
        toast.error("Failed to update");
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
            await handleGridUpdate(id, { image_url: res.secure_url });
        }
    } catch (e) {
        toast.error("Upload failed");
    } finally {
        setUploading(null);
    }
};
