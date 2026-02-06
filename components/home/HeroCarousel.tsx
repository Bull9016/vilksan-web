"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionValue } from "framer-motion";
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
    scrollY: MotionValue<number>;
}

export default function HeroCarousel({ content, scrollY }: HeroCarouselProps) {
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
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                    {/* Layer 1: Huge Background Text */}
                    <motion.div
                        style={{ y: scrollY }}
                        className={`absolute ${zIndexClass} select-none w-full text-center top-[15%] md:top-[5%]`}
                    >
                        <h1
                            className="text-[25vw] leading-none font-bold text-neutral-300 dark:text-neutral-800 tracking-tighter"
                            style={{
                                fontSize: currentSlide.styles.bgText?.fontSize ? `${currentSlide.styles.bgText.fontSize}px` : undefined,
                                transform: `rotate(${currentSlide.styles.bgText?.tilt || 0}deg) translate(${currentSlide.styles.bgText?.x || 0}px, ${currentSlide.styles.bgText?.y || 0}px)`,
                                color: currentSlide.styles.bgText?.color
                            }}
                        >
                            {currentSlide.bgText}
                        </h1>
                    </motion.div>

                    {/* Layer 2: Main Image */}
                    <div className="relative z-10 w-full max-w-7xl px-4 mt-20 md:mt-40 pointer-events-none">
                        <div className="pointer-events-auto">
                            {currentSlide.image && (
                                <EditableImage
                                    contentKey={`slide_img_${currentSlide.id}`} // Dummy key, handled by carousel state usually but re-using component for display
                                    readOnly={true} // Important: We edit in Admin, not here for carousel
                                    src={currentSlide.image}
                                    initialStyle={currentSlide.styles.image}
                                    alt="Hero Image"
                                    width={1600}
                                    height={900}
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                    priority
                                />
                            )}
                        </div>
                    </div>

                    {/* Layer 3: Overlay Content */}
                    <div className="absolute bottom-10 left-6 md:left-12 z-20 max-w-md">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span
                                className="inline-block border border-black dark:border-white px-2 py-0.5 text-xs text-black dark:text-white uppercase tracking-widest mb-4"
                                style={{
                                    transform: `translate(0, ${currentSlide.styles.badge?.y || 0}px)`,
                                    color: currentSlide.styles.badge?.color,
                                    borderColor: currentSlide.styles.badge?.color
                                }}
                            >
                                {currentSlide.badge}
                            </span>
                            <p
                                className="text-xs md:text-sm text-neutral-500 uppercase tracking-widest leading-relaxed"
                                style={{
                                    transform: `translate(0, ${currentSlide.styles.subline?.y || 0}px)`,
                                    color: currentSlide.styles.subline?.color
                                }}
                            >
                                {currentSlide.subline}
                            </p>
                        </motion.div>
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
        </>
    );
}
