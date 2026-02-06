"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ContentItem = { value: string; style: any };
type FooterContent = Record<string, ContentItem>;

export default function Footer({ content }: { content?: FooterContent }) {
    // Default Values
    const heroText = content?.["footer_hero_text"]?.value || "Create Your\nOwn Unique\nLook";
    const ctaHeading = content?.["footer_cta_heading"]?.value || "Get in touch\nwith Vilksan";
    const ctaSubheading = content?.["footer_cta_subheading"]?.value || "Contact us and our managers will be happy to answer all your questions.";

    // Parse Links
    const parseLinks = (key: string) => {
        try {
            const val = content?.[key]?.value;
            if (!val) return [];
            return JSON.parse(val) as { label: string; href: string }[];
        } catch {
            return [];
        }
    };

    const col1Links = parseLinks("footer_col_1_links").length > 0 ? parseLinks("footer_col_1_links") : [
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" }
    ];

    const col2Links = parseLinks("footer_col_2_links").length > 0 ? parseLinks("footer_col_2_links") : [
        { label: "Men", href: "/collections/men" },
        { label: "Women", href: "/collections/women" },
        { label: "Lookbook", href: "/collections/new-arrivals" },
        { label: "About", href: "/about" }
    ];

    const col3Links = parseLinks("footer_col_3_links").length > 0 ? parseLinks("footer_col_3_links") : [
        { label: "Account", href: "/account" },
        { label: "Help Center", href: "/help" },
        { label: "Shipping & Payments", href: "/shipping" },
        { label: "Contacts", href: "/contacts" }
    ];

    return (
        <footer className="bg-black text-white pt-20 pb-10 px-6 md:px-12 overflow-hidden">
            <div className="max-w-[1400px] mx-auto space-y-20">

                {/* Top Section: CTA & Big Typography */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-20">

                    {/* Left: Contact CTA */}
                    <div className="max-w-xs space-y-4 pt-4">
                        <h2 className="text-3xl font-display font-medium uppercase leading-none tracking-tight text-neutral-400 whitespace-pre-line">
                            {ctaHeading.split('\n').map((line, i) => (
                                <span key={i} className={i === 1 ? "text-white" : ""}>{line}<br /></span>
                            ))}
                        </h2>
                        <p className="text-neutral-500 text-sm leading-relaxed">
                            {ctaSubheading}
                        </p>
                    </div>

                    {/* Right: Big Typography */}
                    <div className="flex-1 text-right">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display uppercase leading-[0.85] tracking-tighter text-white whitespace-pre-line">
                            {heroText}
                        </h1>
                    </div>
                </div>

                {/* Bottom Section: Links & Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-neutral-900 pt-16">

                    {/* 1. Brand & Legal */}
                    <div className="flex flex-col justify-between h-full space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-lg">Vilksan</h3>
                            <div className="flex flex-col gap-2 text-xs text-neutral-500 font-medium font-display tracking-wide">
                                {col1Links.map((link, i) => (
                                    <Link key={i} href={link.href} className="hover:text-white transition-colors uppercase">{link.label}</Link>
                                ))}
                            </div>
                        </div>
                        <p className="text-neutral-600 text-[10px] uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} Vilksan. All rights reserved.
                        </p>
                    </div>

                    {/* 2. Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            Navigation
                        </h4>
                        <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest text-neutral-300">
                            {col2Links.map((link, i) => (
                                <Link key={i} href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* 3. Info */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            Info
                        </h4>
                        <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest text-neutral-300">
                            {col3Links.map((link, i) => (
                                <Link key={i} href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* 4. Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            Newsletter
                        </h4>
                        <form className="group relative">
                            <input
                                type="email"
                                placeholder="EMAIL"
                                className="w-full bg-transparent border-b border-neutral-800 py-3 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-white transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </form>

                        {/* Payment Icons (Simulated) */}
                        <div className="flex items-center gap-3 pt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Pay Icons Placeholder */}
                            <div className="flex gap-2 text-neutral-400">
                                <div className="h-5 w-8 bg-neutral-800 rounded flex items-center justify-center text-[8px] font-bold">PAY</div>
                                <div className="h-5 w-8 bg-neutral-800 rounded flex items-center justify-center text-[8px] font-bold">GPay</div>
                                <div className="h-5 w-8 bg-neutral-800 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                                <div className="h-5 w-8 bg-neutral-800 rounded flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-white/20"></div></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}
