"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { blogDetails } from "./blogDetails";
import BlogCard from "./BlogCard";

// Blog carousel: 3-up on desktop, single card on mobile.
// Chrome re-themed to the nm system (yellow active dot, glass arrows).
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

  const renderCard = (i: number) => (
    <BlogCard
      title={at(i).title}
      image={at(i).image}
      url={at(i).url}
      date={at(i).date}
      available={at(i).available}
      index={i}
    />
  );

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
            className="flex w-full items-stretch justify-center gap-3 sm:gap-5"
          >
            <div className="hidden shrink-0 sm:block sm:w-[30%]">
              <div className="scale-[0.94] opacity-80 transition-transform">
                {renderCard(index - 1)}
              </div>
            </div>
            <div className="w-full shrink-0 sm:w-[40%]">
              <div className="py-2 sm:py-3 md:py-4">{renderCard(index)}</div>
            </div>
            <div className="hidden shrink-0 sm:block sm:w-[30%]">
              <div className="scale-[0.94] opacity-80 transition-transform">
                {renderCard(index + 1)}
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
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-accent ring-1 ring-ink/50"
                : "w-2 bg-ink/25 hover:bg-ink/45"
            }`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="font-display text-sm font-medium text-ink">
          {index + 1}
        </span>
        <span className="font-display text-sm text-ink/40">/</span>
        <span className="font-display text-sm font-medium text-ink">
          {items.length}
        </span>
      </div>

      <button
        onClick={prev}
        className="nm-pane absolute left-[10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-3 text-ink transition-all duration-300 hover:bg-accent md:block"
        aria-label="Previous blog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={next}
        className="nm-pane absolute right-[10px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-3 text-ink transition-all duration-300 hover:bg-accent md:block"
        aria-label="Next blog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default BlogCarousel;
