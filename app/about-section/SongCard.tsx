import Image from "next/image";
import { SongProps } from "./songDetails";
import Link from "next/link";

/*
 * SongCard — nm chip card: cover art in a dark inlay, Tr 3 A title,
 * muted artist, yellow play affordance on hover.
 */
const SongCard = ({ title, artist, image, link }: SongProps) => {
  return (
    <Link
      href={link}
      target="_blank"
      aria-label={`Play ${title} by ${artist} on Spotify`}
      className="group block shrink-0"
    >
      <div className="nm-card nm-pad-s flex w-[190px] flex-col gap-3 transition-transform duration-300 group-hover:-translate-y-1 sm:w-[210px] md:w-[230px]">
        <div className="nm-plate relative aspect-square w-full overflow-hidden rounded-[var(--radius-inner)]">
          <Image
            src={image}
            alt={`${title} — ${artist}`}
            fill
            sizes="(max-width: 768px) 190px, 230px"
            className="object-cover grayscale transition duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="min-w-0">
            <p className="truncate font-display text-[14px] font-medium uppercase leading-tight text-ink md:text-[15px]">
              {title}
            </p>
            <p className="nm-small truncate text-ink/55">{artist}</p>
          </div>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
              <path d="M3 1.5v9l7-4.5z" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SongCard;
