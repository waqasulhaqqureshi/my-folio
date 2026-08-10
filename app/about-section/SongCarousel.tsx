import SongCard from "./SongCard";
import { songs, SongProps } from "./songDetails";
import { CSSProperties } from "react";

/*
 * SongCarousel — seamless infinite marquee using the global .nm-marquee
 * utility (translateX(-50%) loop over 2 duplicated tracks). Self-contained:
 * doesn't rely on the legacy %/left keyframes in animations/animate.css,
 * and can never cause horizontal page scroll (clips overflow locally).
 */
const SongCarousel = () => {
  return (
    <div
      className="relative w-full overflow-hidden py-2"
      aria-label="Favorite songs marquee"
    >
      <div
        className="nm-marquee gap-4 pr-4 md:gap-5 md:pr-5"
        style={{ "--marquee-duration": "32s" } as CSSProperties}
      >
        {[0, 1].map((track) => (
          <div
            key={track}
            className="flex gap-4 md:gap-5"
            aria-hidden={track === 1}
          >
            {songs.map((song: SongProps, index: number) => (
              <SongCard
                key={`${track}-${index}`}
                title={song.title}
                artist={song.artist}
                image={song.image}
                link={song.link}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Edge fades → the marquee visually "bleeds" out like the source site */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#d5cfbe] to-transparent md:w-28"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#d5cfbe] to-transparent md:w-28"
        aria-hidden="true"
      />
    </div>
  );
};

export default SongCarousel;
