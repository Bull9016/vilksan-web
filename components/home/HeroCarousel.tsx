"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "@/components/ui/EditableImage";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
    id: string;
    bgText: string;
    badge: string;
    subline: string;
    image: string;
    textPosition: "behind" | "front" | "over";
    duration: number;
    styles: {
        bgText?: any;
        badge?: any;
        subline?: any;
        image?: any;
    };
}

interface HeroCarouselProps {
    content: { [key: string]: { value: string; style?: any } };
}

export default function HeroCarousel({ content }: HeroCarouselProps) {
    const { scrollY } = useScroll();
    const yText = useTransform(scrollY, [0, 500], [0, 150]);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Initialize slides from content
    useEffect(() => {
        let loadedSlides: HeroSlide[] = [];
        try {
            if (content["home_hero_slides"]?.value) {
                loadedSlides = JSON.parse(content["home_hero_slides"].value);
            }
        } catch (e) {
            console.error("Failed to parse hero slides", e);
        }

        // Fallback to legacy content if no slides found
        if (loadedSlides.length === 0) {
            loadedSlides = [{
                id: "legacy",
                bgText: content["home_hero_bg_text"]?.value || "VILKSAN",
                badge: content["home_hero_badge"]?.value || "New Collection",
                subline: content["home_hero_subline"]?.value || "Discover our latest arrivals.",
                image: content["home_hero_main_image"]?.value || "",
                textPosition: (content["home_hero_text_position"]?.value as any) || "behind",
                duration: 5,
                styles: {
                    bgText: content["home_hero_bg_text"]?.style,
                    badge: content["home_hero_badge"]?.style,
                    subline: content["home_hero_subline"]?.style,
                    image: content["home_hero_main_image"]?.style,
                }
            }];
        }
        setSlides(loadedSlides);
    }, [content]);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, (slides[currentIndex]?.duration || 5) * 1000);

        return () => clearInterval(interval);
    }, [slides.length, currentIndex, slides]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    if (slides.length === 0) return null;

    const currentSlide = slides[currentIndex];
    const textPosition = currentSlide.textPosition || "behind";
    const zIndexClass = (textPosition === "over" || textPosition === "front") ? "z-30" : "z-0";

    return (
        <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                    {/* Layer 1: Background Elements (Behind Image) */}
                    <motion.div
                        style={{ y: yText }}
                        className={`absolute ${zIndexClass} select-none w-full text-center top-[10%] md:top-0 h-full flex items-center justify-center`}
                    >
                        <h1
                            className="text-[28vw] leading-none font-bold text-neutral-200 dark:text-neutral-800 tracking-tighter opacity-80"
                            style={{
                                fontSize: currentSlide.styles.bgText?.fontSize ? `${currentSlide.styles.bgText.fontSize}px` : undefined,
                                transform: `rotate(${currentSlide.styles.bgText?.tilt || 0}deg) translate(${currentSlide.styles.bgText?.x || 0}px, ${currentSlide.styles.bgText?.y || 0}px)`,
                                color: currentSlide.styles.bgText?.color,
                                fontFamily: currentSlide.styles.bgText?.fontFamily || 'var(--font-inter)',
                            }}
                        >
                            {currentSlide.bgText}
                        </h1>

                        {/* Optional: Render Subline Behind if layer='behind' */}
                        {currentSlide.styles.subline?.layer === 'behind' && (
                            <h2
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter mix-blend-overlay opacity-50 whitespace-nowrap"
                                style={{
                                    color: currentSlide.styles.subline?.color,
                                    fontSize: currentSlide.styles.subline?.fontSize ? `${currentSlide.styles.subline.fontSize}px` : undefined,
                                    transform: `translate(${currentSlide.styles.subline?.x || 0}px, ${currentSlide.styles.subline?.y || 0}px)`,
                                    fontFamily: 'var(--font-oswald)'
                                }}
                                dangerouslySetInnerHTML={{ __html: currentSlide.subline?.replace(/\n/g, "<br/>") || "" }}
                            />
                        )}

                        {/* Optional: Render Badge Behind if layer='behind' */}
                        {currentSlide.styles.badge?.layer === 'behind' && currentSlide.badge && (
                            <span
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-block border border-black dark:border-white px-6 py-2 text-xs font-bold uppercase"
                                style={{
                                    fontSize: currentSlide.styles.badge?.fontSize ? `${currentSlide.styles.badge.fontSize}px` : undefined,
                                    transform: `translate(${currentSlide.styles.badge?.x || 0}px, ${currentSlide.styles.badge?.y || 0}px)`,
                                    color: currentSlide.styles.badge?.color,
                                    borderColor: currentSlide.styles.badge?.color
                                }}
                            >
                                {currentSlide.badge}
                            </span>
                        )}
                    </motion.div>

                    {/* Layer 2: Main Image */}
                    <div className="relative z-10 w-full max-w-7xl px-4 h-full flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto w-full md:w-[60%] lg:w-[50%] h-[70%] relative">
                            {currentSlide.image && (
                                <EditableImage
                                    contentKey={`slide_img_${currentSlide.id}`}
                                    readOnly={true}
                                    src={currentSlide.image}
                                    initialStyle={currentSlide.styles.image}
                                    alt="Hero Image"
                                    width={1600}
                                    height={900}
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                    priority
                                />
                            )}
                        </div>
                    </div>

                    {/* Layer 3: Foreground Text Overlay (In Front) */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center pointer-events-none">
                        <div className="max-w-7xl w-full px-6 md:px-12 relative h-full">
                            {/* Top Right Menu / Date Indicators (Decoration) */}
                            <div className="absolute top-12 right-6 md:right-12 flex flex-col items-end border-r border-black dark:border-white pr-4 gap-2">
                                <span className="text-xs font-bold">0{currentIndex + 1}/0{slides.length}</span>
                                <div className="h-4 w-[1px] bg-black dark:bg-white/50"></div>
                            </div>

                            {/* Center-Left Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="absolute top-1/2 -translate-y-1/2 left-4 md:left-24 w-full md:w-auto"
                            >
                                {/* Default behavior: Render Subline Front unless layer='behind' */}
                                {(currentSlide.styles.subline?.layer !== 'behind') && (
                                    <h2
                                        className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-black dark:text-white mix-blend-exclusion"
                                        style={{
                                            color: currentSlide.styles.subline?.color,
                                            fontSize: currentSlide.styles.subline?.fontSize ? `${currentSlide.styles.subline.fontSize}px` : undefined,
                                            transform: `translate(${currentSlide.styles.subline?.x || 0}px, ${currentSlide.styles.subline?.y || 0}px)`,
                                            fontFamily: 'var(--font-oswald)'
                                        }}
                                        dangerouslySetInnerHTML={{
                                            // Allow breaking text (e.g. "ADDICTED<br>TO<br>FASHION")
                                            __html: currentSlide.subline?.replace(/\n/g, "<br/>") || ""
                                        }}
                                    />
                                )}

                                {/* Default behavior: Render Badge Front unless layer='behind' */}
                                {(currentSlide.styles.badge?.layer !== 'behind') && currentSlide.badge && (
                                    <div className="mt-8 relative pl-12" style={{ transform: `translate(${currentSlide.styles.badge?.x || 0}px, ${currentSlide.styles.badge?.y || 0}px)` }}>
                                        {/* Decorative Line matches badge y not x */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-black dark:bg-white"></div>
                                        <span
                                            className="inline-block border border-black dark:border-white px-6 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all pointer-events-auto cursor-pointer"
                                            style={{
                                                fontSize: currentSlide.styles.badge?.fontSize ? `${currentSlide.styles.badge.fontSize}px` : undefined,
                                                color: currentSlide.styles.badge?.color,
                                                borderColor: currentSlide.styles.badge?.color
                                            }}
                                        >
                                            {currentSlide.badge}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Scroll Indicator */}
                            <div className="absolute bottom-12 left-6 md:left-12 flex items-center gap-4 -rotate-90 origin-left">
                                <span className="text-[10px] uppercase font-bold tracking-widest">Scroll</span>
                                <div className="w-12 h-[1px] bg-black dark:bg-white"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-black dark:text-white transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-black dark:text-white transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-black dark:bg-white w-6' : 'bg-neutral-400/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
