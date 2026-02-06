"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper({ content }: { content: any }) {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin") || pathname?.startsWith("/products/")) {
        return null;
    }

    return <Footer content={content} />;
}
