"use client";
import Link from "next/link";
import { blogProps } from "./blogDetails";
import SafeImage from "../components/SafeImage";
import { motion } from "framer-motion";

/*
 * BlogCard — nm glass card: cover in a dark inlay plate, Tr 3 A title,
 * yellow date chip.
 *
 * The card now routes to the in-app article at /blog/<slug> instead of opening
 * a preview modal or sending the reader off-site. The whole card is one Link
 * (rather than a link on the image plus another on the title) so there is a
 * single tab stop and a single large hit target.
 *
 * `available: false` entries have no article file, so they must not be
 * clickable — those render as an inert <div> rather than a disabled link,
 * because an <a> with no href is not focusable and announces as plain text
 * anyway.
 */
/* `url` is attribution metadata consumed by the article page, not the card. */
type BlogCardProps = Omit<blogProps, "url">;

const BlogCard = ({ title, image, slug, date, available, index }: BlogCardProps) => {
  const shell = (
    <>
      <div className="nm-plate relative block w-full overflow-hidden rounded-[var(--radius-inner)]">
        <div className="relative aspect-[16/9] w-full">
          <SafeImage
            src={image}
            alt=""
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
      </div>

      <div className="flex flex-1 flex-col items-start justify-between gap-3 px-1 pb-1">
        <h3 className="font-display text-[16px] font-medium uppercase leading-snug tracking-wide text-ink line-clamp-2 md:text-[18px]">
          {title}
        </h3>
        <div className="flex w-full items-center justify-between gap-3">
          <span className="nm-chip bg-ink text-accent">{date}</span>
          {available && (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-accent transition-transform duration-300 ease-[var(--ease-nm)] group-hover:translate-x-0.5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
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
      className="h-full w-full"
    >
      {available ? (
        <Link
          href={`/blog/${slug}`}
          className="nm-card-framed group nm-pad flex h-full w-full flex-col gap-4 rounded-[var(--radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-label={`Read: ${title}`}
        >
          {shell}
        </Link>
      ) : (
        <div className="nm-card-framed group nm-pad flex h-full w-full cursor-default flex-col gap-4">
          {shell}
        </div>
      )}
    </motion.article>
  );
};

export default BlogCard;
