"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { blogDetails } from "./blogDetails";
import BlogCard from "./BlogCard";

// Blog carousel with 3-up preview: center bigger, sides smaller. Similar to certificate carousel.
const BlogCarousel = () => {
  const items = useMemo(() => blogDetails, []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  const onDragEnd = (_: any, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x > threshold) prev();
    else if (info.offset.x < -threshold) next();
  };

  const at = (i: number) => items[(i + items.length) % items.length];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 3-up layout on desktop, single centered card on mobile with responsive padding */}
      {/* overflow-x-hidden prevents horizontal scroll, overflow-y-visible allows scaled card to show */}
      <div className="relative mx-auto max-w-[1345px] overflow-x-hidden overflow-y-visible px-4 py-4 md:px-16 md:py-6 lg:px-20 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 220 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -220 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full items-center justify-center gap-3 sm:gap-5"
          >
            {/* prev (smaller) - hidden on mobile */}
            <div className="hidden shrink-0 sm:block sm:w-[30%]">
              <div className="scale-[0.9] opacity-80 transition-transform">
                <BlogCard
                  title={at(index - 1).title}
                  image={at(index - 1).image}
                  url={at(index - 1).url}
                  date={at(index - 1).date}
                  available={at(index - 1).available}
                  index={index - 1}
                />
              </div>
            </div>

            {/* current (bigger) - full width on mobile, 40% on desktop */}
            {/* Added padding to accommodate scale effect */}
            <div className="w-full shrink-0 sm:w-[40%]">
              <div className="scale-[1.02] py-2 sm:py-3 md:py-4">
                <BlogCard
                  title={at(index).title}
                  image={at(index).image}
                  url={at(index).url}
                  date={at(index).date}
                  available={at(index).available}
                  index={index}
                />
              </div>
            </div>

            {/* next (smaller) - hidden on mobile */}
            <div className="hidden shrink-0 sm:block sm:w-[30%]">
              <div className="scale-[0.9] opacity-80 transition-transform">
                <BlogCard
                  title={at(index + 1).title}
                  image={at(index + 1).image}
                  url={at(index + 1).url}
                  date={at(index + 1).date}
                  available={at(index + 1).available}
                  index={index + 1}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to blog ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Numeric progress, centered below dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-white/70">
          {index + 1}
        </span>
        <span className="text-sm text-white/40">/</span>
        <span className="text-sm font-semibold text-white/70">
          {items.length}
        </span>
      </div>

      {/* Navigation Arrows - hidden on mobile, visible on desktop */}
      <button
        onClick={prev}
        className="hidden md:block absolute left-[10px] top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Previous blog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white md:h-8 md:w-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>
      <button
        onClick={next}
        className="hidden md:block absolute right-[10px] top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Next blog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white md:h-8 md:w-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  );
};

export default BlogCarousel;

