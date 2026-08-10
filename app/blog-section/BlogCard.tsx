"use client";
import { blogProps } from "./blogDetails";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import BlogModal from "./BlogModal";

/*
 * BlogCard — nm glass card: cover in a dark inlay plate, Tr 3 A title,
 * yellow date chip; opens the themed BlogModal (contract unchanged).
 */
const BlogCard = ({ title, image, url, date, available, index }: blogProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => {
    if (available) setIsModalOpen(true);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            delay: 0.1 * Math.abs(index % 3),
            ease: [0.44, 0, 0.22, 0.99],
          },
        }}
        viewport={{ amount: "some", once: true }}
        className="nm-card group nm-pad flex h-full w-full flex-col gap-4"
        aria-label={`Blog post: ${title}`}
      >
        <button
          onClick={handleOpen}
          disabled={!available}
          aria-label={available ? `Preview ${title}` : `${title} — coming soon`}
          className={`nm-plate relative block w-full overflow-hidden rounded-[var(--radius-inner)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            available ? "cursor-zoom-in" : "cursor-default"
          }`}
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 92vw, 420px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>
          {!available && (
            <span className="nm-eyebrow absolute left-3 top-3 bg-canvas/80 text-ink backdrop-blur-md">
              Coming soon
            </span>
          )}
        </button>

        <div className="flex flex-1 flex-col items-start justify-between gap-3 px-1 pb-1">
          <h3 className="font-display text-[16px] font-medium uppercase leading-snug tracking-wide text-ink line-clamp-2 md:text-[18px]">
            {title}
          </h3>
          <span className="nm-chip bg-accent">{date}</span>
        </div>
      </motion.article>

      {available && (
        <BlogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          blogImage={image}
          blogTitle={title}
          blogDate={date}
          blogUrl={url}
        />
      )}
    </>
  );
};

export default BlogCard;
